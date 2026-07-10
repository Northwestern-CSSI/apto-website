"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export type KineticMode = "gravity" | "vortex" | "liquid" | "morph";

export type EngineStatus =
  | "initializing"
  | "webgpu"
  | "webgl2"
  | "css-fallback"
  | "unavailable";

type SharedEngineProps = {
  className?: string;
  paused?: boolean;
  style?: CSSProperties;
  intensity?: number;
  showBadge?: boolean;
  onStatusChange?: (status: EngineStatus) => void;
};

export type WebGLFieldProps = SharedEngineProps & {
  mode?: KineticMode;
  colors?: readonly [string, string, string];
};

export type WebGPUPrismProps = SharedEngineProps & {
  colors?: readonly [string, string, string];
};

const DEFAULT_COLORS = ["#72f7d4", "#7b7cff", "#ff5ac8"] as const;

const ENGINE_LABELS: Record<EngineStatus, string> = {
  initializing: "Visual engine starting",
  webgpu: "WebGPU live",
  webgl2: "WebGL live",
  "css-fallback": "Lightweight visual mode",
  unavailable: "Static visual mode",
};

const baseWrapperStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  minHeight: "min(72vh, 720px)",
  overflow: "hidden",
  isolation: "isolate",
  background: "#080b12",
};

const canvasStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "block",
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseHexColor(value: string): [number, number, number] {
  const clean = value.trim().replace(/^#/, "");
  const expanded = clean.length === 3
    ? clean.split("").map((letter) => `${letter}${letter}`).join("")
    : clean;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return [1, 1, 1];
  return [
    Number.parseInt(expanded.slice(0, 2), 16) / 255,
    Number.parseInt(expanded.slice(2, 4), 16) / 255,
    Number.parseInt(expanded.slice(4, 6), 16) / 255,
  ];
}

function mergeStyles(style?: CSSProperties): CSSProperties {
  return style ? { ...baseWrapperStyle, ...style } : baseWrapperStyle;
}

export function EngineStatusBadge({ status }: { status: EngineStatus }) {
  return (
    <span
      className="kinetic-engine__status"
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        zIndex: 3,
        right: 12,
        bottom: 12,
        padding: "7px 10px",
        border: "1px solid rgb(255 255 255 / 0.22)",
        borderRadius: 999,
        color: "rgb(255 255 255 / 0.82)",
        background: "rgb(4 7 13 / 0.62)",
        backdropFilter: "blur(12px)",
        font: "600 10px/1.1 ui-monospace, SFMono-Regular, Menlo, monospace",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {ENGINE_LABELS[status]}
    </span>
  );
}

function CssKineticFallback({
  mode,
  colors,
}: {
  mode: KineticMode;
  colors: readonly [string, string, string];
}) {
  const backgroundByMode: Record<KineticMode, string> = {
    gravity: `radial-gradient(circle at var(--kx, 54%) var(--ky, 42%), ${colors[0]}99 0 2%, transparent 17%), radial-gradient(circle at 30% 66%, ${colors[1]}66, transparent 31%), radial-gradient(circle at 74% 24%, ${colors[2]}55, transparent 26%), #080b12`,
    vortex: `repeating-conic-gradient(from 18deg at var(--kx, 50%) var(--ky, 50%), ${colors[0]}44 0 5deg, transparent 7deg 19deg, ${colors[1]}30 21deg 25deg, transparent 28deg 42deg), radial-gradient(circle, #11182b, #05070d 68%)`,
    liquid: `radial-gradient(ellipse at var(--kx, 48%) var(--ky, 44%), ${colors[0]}88, transparent 28%), radial-gradient(ellipse at 75% 70%, ${colors[1]}88, transparent 36%), linear-gradient(135deg, ${colors[2]}55, #07111c 54%, #05070d)`,
    morph: `radial-gradient(ellipse 38% 55% at var(--kx, 42%) var(--ky, 50%), ${colors[0]}99, transparent 70%), radial-gradient(ellipse 42% 38% at 65% 54%, ${colors[2]}88, transparent 72%), linear-gradient(120deg, #080b12, ${colors[1]}55)`,
  };

  return (
    <div
      className={`kinetic-engine__fallback kinetic-engine__fallback--${mode}`}
      data-engine-status="css-fallback"
      aria-hidden="true"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--kx", `${((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100}%`);
        event.currentTarget.style.setProperty("--ky", `${((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100}%`);
      }}
      style={{
        position: "absolute",
        inset: 0,
        background: backgroundByMode[mode],
        transition: "background-position 180ms ease-out",
      }}
    />
  );
}

const FIELD_VERTEX_SHADER = `#version 300 es
precision highp float;

const vec2 positions[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2(3.0, -1.0),
  vec2(-1.0, 3.0)
);

void main() {
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}`;

const FIELD_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_scroll;
uniform float u_intensity;
uniform int u_mode;
uniform vec3 u_color_a;
uniform vec3 u_color_b;
uniform vec3 u_color_c;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 turn = mat2(0.82, -0.57, 0.57, 0.82);
  for (int i = 0; i < 5; i++) {
    value += noise(p) * amplitude;
    p = turn * p * 2.03 + 13.7;
    amplitude *= 0.5;
  }
  return value;
}

vec3 palette(float t) {
  vec3 first = mix(u_color_a, u_color_b, smoothstep(0.0, 0.58, t));
  return mix(first, u_color_c, smoothstep(0.58, 1.0, t));
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(u_resolution, vec2(1.0));
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);
  vec2 mouse = u_pointer * 2.0 - 1.0;
  mouse.x *= u_resolution.x / max(u_resolution.y, 1.0);
  float t = u_time;
  vec3 color = vec3(0.015, 0.022, 0.045);

  if (u_mode == 0) {
    float glow = 0.0;
    float trails = 0.0;
    for (int i = 0; i < 14; i++) {
      float fi = float(i);
      vec2 seed = vec2(hash21(vec2(fi, 2.1)), hash21(vec2(fi, 9.7))) * 2.0 - 1.0;
      seed.x *= u_resolution.x / max(u_resolution.y, 1.0);
      float orbit = t * (0.07 + hash21(vec2(fi)) * 0.12) + fi * 1.71 + u_scroll * 3.0;
      vec2 point = seed * 0.84 + vec2(cos(orbit), sin(orbit * 0.83)) * (0.04 + 0.05 * sin(fi));
      vec2 pull = mouse - point;
      point += pull * (0.09 + 0.04 * sin(t * 0.5 + fi));
      float d = length(p - point);
      glow += (0.0022 + 0.0012 * u_intensity) / (d * d + 0.0015);
      trails += exp(-abs(length(p - mouse) - length(point - mouse)) * 18.0) * 0.018;
    }
    float field = clamp(glow * 0.11 + trails, 0.0, 1.0);
    color += palette(fract(field + u_scroll * 0.3)) * field;
    color += u_color_a * exp(-length(p - mouse) * 5.5) * 0.18;
  } else if (u_mode == 1) {
    vec2 q = p - mouse * 0.25;
    float radius = length(q);
    float angle = atan(q.y, q.x) + radius * (5.0 + u_intensity * 2.0) - t * 0.34 - u_scroll * 4.0;
    float ribbons = 0.5 + 0.5 * sin(angle * 5.0 - radius * 18.0);
    float rings = 0.5 + 0.5 * cos(radius * 28.0 - t * 0.8);
    float core = exp(-radius * 2.4);
    float field = pow(ribbons, 5.0) * (0.25 + rings * 0.75) * smoothstep(1.3, 0.05, radius);
    color += palette(fract(angle / 6.283 + radius + u_scroll)) * (field * 1.25 + core * 0.16);
  } else if (u_mode == 2) {
    vec2 q = p * (1.35 + u_intensity * 0.12);
    q += (mouse - p) * 0.12;
    float n1 = fbm(q * 1.8 + vec2(t * 0.09, -t * 0.07 + u_scroll * 2.0));
    float n2 = fbm(q * 3.1 + vec2(-t * 0.05, t * 0.08) + n1 * 2.0);
    float membrane = smoothstep(0.38, 0.78, n2 + 0.14 * sin((q.x + q.y) * 7.0 - t * 0.35));
    color += palette(clamp(n1 * 0.62 + n2 * 0.5, 0.0, 1.0)) * (0.16 + membrane * 0.72);
    color += u_color_a * exp(-length(p - mouse) * 4.0) * 0.2;
  } else {
    vec2 drift = vec2(sin(t * 0.19), cos(t * 0.16)) * 0.12;
    float d1 = length(p - mouse * 0.34 - drift) - (0.34 + 0.08 * sin(t * 0.3));
    float d2 = length(p + vec2(0.42, -0.12 + u_scroll * 0.15)) - 0.42;
    float d3 = length(p - vec2(0.38, 0.24)) - (0.28 + u_intensity * 0.035);
    float blend = -log(exp(-7.0 * d1) + exp(-7.0 * d2) + exp(-7.0 * d3)) / 7.0;
    float body = smoothstep(0.05, -0.18, blend);
    float edge = exp(-abs(blend) * 24.0);
    float texture = fbm(p * 3.2 + t * 0.035);
    color += palette(clamp(texture + body * 0.28 + u_scroll * 0.15, 0.0, 1.0)) * (body * 0.74 + edge * 0.62);
  }

  float vignette = smoothstep(1.5, 0.18, length(p * vec2(0.74, 0.94)));
  color *= 0.42 + vignette * 0.72;
  color = pow(color, vec3(0.88));
  fragColor = vec4(color, 1.0);
}`;

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function WebGLField({
  mode = "gravity",
  className = "",
  paused = false,
  style,
  intensity = 1,
  colors = DEFAULT_COLORS,
  showBadge = false,
  onStatusChange,
}: WebGLFieldProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<EngineStatus>("initializing");

  const reportStatus = useCallback((nextStatus: EngineStatus) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  }, [onStatusChange]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    reportStatus("initializing");
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      reportStatus("css-fallback");
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, FIELD_VERTEX_SHADER);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FIELD_FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertexShader || !fragmentShader || !program) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      if (program) gl.deleteProgram(program);
      reportStatus("css-fallback");
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      reportStatus("css-fallback");
      return;
    }

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const pointerLocation = gl.getUniformLocation(program, "u_pointer");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const scrollLocation = gl.getUniformLocation(program, "u_scroll");
    const intensityLocation = gl.getUniformLocation(program, "u_intensity");
    const modeLocation = gl.getUniformLocation(program, "u_mode");
    const colorALocation = gl.getUniformLocation(program, "u_color_a");
    const colorBLocation = gl.getUniformLocation(program, "u_color_b");
    const colorCLocation = gl.getUniformLocation(program, "u_color_c");
    const modeIndex: Record<KineticMode, number> = { gravity: 0, vortex: 1, liquid: 2, morph: 3 };
    const colorA = parseHexColor(colors[0]);
    const colorB = parseHexColor(colors[1]);
    const colorC = parseHexColor(colors[2]);
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    let frame = 0;
    let disposed = false;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let smoothPointerX = 0.5;
    let smoothPointerY = 0.5;
    let scrollProgress = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = (now: number) => {
      frame = 0;
      if (disposed) return;
      resize();
      const delta = Math.min(50, Math.max(0, now - lastTime));
      lastTime = now;
      if (!paused && !reducedMotion) elapsed += delta / 1000;
      smoothPointerX += (pointerX - smoothPointerX) * (reducedMotion ? 1 : 0.075);
      smoothPointerY += (pointerY - smoothPointerY) * (reducedMotion ? 1 : 0.075);

      gl.useProgram(program);
      if (resolutionLocation) gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      if (pointerLocation) gl.uniform2f(pointerLocation, smoothPointerX, smoothPointerY);
      if (timeLocation) gl.uniform1f(timeLocation, elapsed);
      if (scrollLocation) gl.uniform1f(scrollLocation, scrollProgress);
      if (intensityLocation) gl.uniform1f(intensityLocation, clamp(intensity, 0, 3));
      if (modeLocation) gl.uniform1i(modeLocation, modeIndex[mode]);
      if (colorALocation) gl.uniform3f(colorALocation, ...colorA);
      if (colorBLocation) gl.uniform3f(colorBLocation, ...colorB);
      if (colorCLocation) gl.uniform3f(colorCLocation, ...colorC);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!paused && !reducedMotion) frame = window.requestAnimationFrame(draw);
    };

    const requestDraw = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      pointerX = clamp((event.clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
      pointerY = 1 - clamp((event.clientY - rect.top) / Math.max(rect.height, 1), 0, 1);
      requestDraw();
    };

    const onPointerLeave = () => {
      pointerX = 0.5;
      pointerY = 0.5;
      requestDraw();
    };

    const onScroll = () => {
      const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = clamp(window.scrollY / range, 0, 1);
      requestDraw();
    };

    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      requestDraw();
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      reportStatus("css-fallback");
    };

    const resizeObserver = new ResizeObserver(requestDraw);
    resizeObserver.observe(wrapper);
    wrapper.addEventListener("pointermove", onPointerMove, { passive: true });
    wrapper.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    reducedMotionQuery.addEventListener("change", onMotionChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    onScroll();
    reportStatus("webgl2");
    requestDraw();

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      reducedMotionQuery.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteProgram(program);
    };
  }, [colors, intensity, mode, paused, reportStatus]);

  return (
    <div
      ref={wrapperRef}
      className={`kinetic-engine kinetic-engine--${mode} ${className}`.trim()}
      data-engine-status={status}
      style={mergeStyles(style)}
    >
      <canvas ref={canvasRef} aria-hidden="true" tabIndex={-1} style={canvasStyle} />
      {status === "css-fallback" || status === "unavailable"
        ? <CssKineticFallback mode={mode} colors={colors} />
        : null}
      {showBadge ? <EngineStatusBadge status={status} /> : null}
    </div>
  );
}

type GPUBufferLike = { destroy: () => void };
type GPUTextureLike = { createView: () => unknown };
type GPURenderPipelineLike = { getBindGroupLayout: (index: number) => unknown };
type GPURenderPassLike = {
  setPipeline: (pipeline: GPURenderPipelineLike) => void;
  setBindGroup: (index: number, group: unknown) => void;
  draw: (vertexCount: number) => void;
  end: () => void;
};
type GPUCommandEncoderLike = {
  beginRenderPass: (descriptor: unknown) => GPURenderPassLike;
  finish: () => unknown;
};
type GPUQueueLike = {
  writeBuffer: (buffer: GPUBufferLike, offset: number, data: Float32Array) => void;
  submit: (commands: readonly unknown[]) => void;
};
type GPUDeviceLike = {
  queue: GPUQueueLike;
  lost: Promise<unknown>;
  createShaderModule: (descriptor: { code: string }) => unknown;
  createRenderPipeline: (descriptor: unknown) => GPURenderPipelineLike;
  createBuffer: (descriptor: unknown) => GPUBufferLike;
  createBindGroup: (descriptor: unknown) => unknown;
  createCommandEncoder: () => GPUCommandEncoderLike;
  destroy?: () => void;
};
type GPUAdapterLike = { requestDevice: () => Promise<GPUDeviceLike> };
type GPUInterfaceLike = {
  requestAdapter: (options?: unknown) => Promise<GPUAdapterLike | null>;
  getPreferredCanvasFormat: () => string;
};
type GPUCanvasContextLike = {
  configure: (descriptor: unknown) => void;
  getCurrentTexture: () => GPUTextureLike;
  unconfigure?: () => void;
};

const PRISM_SHADER = `
struct Uniforms {
  resolution: vec2<f32>,
  pointer: vec2<f32>,
  time: f32,
  scroll: f32,
  intensity: f32,
  motion: f32,
  colorA: vec4<f32>,
  colorB: vec4<f32>,
  colorC: vec4<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  return vec4<f32>(positions[vertexIndex], 0.0, 1.0);
}

fn rotate(point: vec2<f32>, angle: f32) -> vec2<f32> {
  let c = cos(angle);
  let s = sin(angle);
  return mat2x2<f32>(c, -s, s, c) * point;
}

fn triangleSdf(point: vec2<f32>, radius: f32) -> f32 {
  let p = vec2<f32>(abs(point.x), point.y);
  return max(p.x * 0.866025 + p.y * 0.5, -p.y) - radius;
}

fn spectrum(t: f32) -> vec3<f32> {
  let first = mix(uniforms.colorA.rgb, uniforms.colorB.rgb, smoothstep(0.0, 0.58, t));
  return mix(first, uniforms.colorC.rgb, smoothstep(0.58, 1.0, t));
}

@fragment
fn fragmentMain(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
  let safeResolution = max(uniforms.resolution, vec2<f32>(1.0));
  var uv = position.xy / safeResolution * 2.0 - 1.0;
  uv.y = -uv.y;
  uv.x *= safeResolution.x / safeResolution.y;
  var pointer = uniforms.pointer * 2.0 - 1.0;
  pointer.y = -pointer.y;
  pointer.x *= safeResolution.x / safeResolution.y;

  let angle = uniforms.time * 0.075 + pointer.x * 0.22 + uniforms.scroll * 1.8;
  let p = rotate(uv - pointer * 0.08, angle);
  let depth = 0.12 * sin(p.y * 7.0 - uniforms.time * 0.28) + 0.05 * cos(p.x * 11.0);
  let outer = triangleSdf(p + vec2<f32>(0.0, depth), 0.76 + uniforms.intensity * 0.025);
  let inner = triangleSdf(rotate(p, -angle * 1.7), 0.38 + depth * 0.2);
  let shell = exp(-abs(outer) * 28.0);
  let core = smoothstep(0.05, -0.2, inner);
  let facets = 0.5 + 0.5 * sin(atan2(p.y, p.x) * 3.0 + length(p) * 8.0 - uniforms.time * 0.22);
  let interference = 0.5 + 0.5 * cos((outer - inner) * 36.0 - uniforms.time * 0.36);
  let chroma = fract(facets * 0.46 + interference * 0.34 + uniforms.scroll * 0.35 + length(p - pointer) * 0.22);
  let spectral = spectrum(chroma);
  let mouseLight = exp(-length(uv - pointer) * 2.7);
  let mist = 0.5 + 0.5 * sin(uv.x * 6.0 + uv.y * 5.0 + uniforms.time * 0.08);
  let background = vec3<f32>(0.012, 0.018, 0.04) + spectral * mist * 0.055;
  let color = background + spectral * (shell * 1.25 + core * (0.24 + facets * 0.32)) + uniforms.colorA.rgb * mouseLight * 0.13;
  return vec4<f32>(pow(color, vec3<f32>(0.88)), 1.0);
}`;

export function WebGPUPrism({
  className = "",
  paused = false,
  style,
  intensity = 1,
  colors = DEFAULT_COLORS,
  showBadge = false,
  onStatusChange,
}: WebGPUPrismProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<EngineStatus>("initializing");
  const [useFallback, setUseFallback] = useState(false);

  const reportStatus = useCallback((nextStatus: EngineStatus) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  }, [onStatusChange]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    let disposed = false;
    let frame = 0;
    let device: GPUDeviceLike | null = null;
    let context: GPUCanvasContextLike | null = null;
    let uniformBuffer: GPUBufferLike | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let removeRuntimeListeners = () => undefined;
    let fallbackTimer = 0;
    let fallbackStarted = false;

    setUseFallback(false);
    reportStatus("initializing");

    const fallBack = () => {
      if (disposed || fallbackStarted) return;
      fallbackStarted = true;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      setUseFallback(true);
    };

    const initialize = async () => {
      const gpu = (navigator as Navigator & { gpu?: GPUInterfaceLike }).gpu;
      if (!gpu) {
        fallBack();
        return;
      }

      try {
        const adapter = await gpu.requestAdapter({ powerPreference: "high-performance" });
        if (!adapter || disposed || fallbackStarted) {
          fallBack();
          return;
        }
        device = await adapter.requestDevice();
        if (disposed || fallbackStarted) {
          device.destroy?.();
          return;
        }

        context = (canvas as HTMLCanvasElement & {
          getContext: (contextId: "webgpu") => GPUCanvasContextLike | null;
        }).getContext("webgpu");
        if (!context) {
          fallBack();
          return;
        }

        const format = gpu.getPreferredCanvasFormat();
        const shader = device.createShaderModule({ code: PRISM_SHADER });
        const pipeline = device.createRenderPipeline({
          layout: "auto",
          vertex: { module: shader, entryPoint: "vertexMain" },
          fragment: { module: shader, entryPoint: "fragmentMain", targets: [{ format }] },
          primitive: { topology: "triangle-list" },
        });
        uniformBuffer = device.createBuffer({
          size: 80,
          usage: 0x40 | 0x08,
        });
        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
        });
        const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        let reducedMotion = reducedQuery.matches;
        let pointerX = 0.5;
        let pointerY = 0.5;
        let smoothPointerX = 0.5;
        let smoothPointerY = 0.5;
        let scrollProgress = 0;
        let lastTime = performance.now();
        let elapsed = 0;
        let contextConfigured = false;
        const colorA = parseHexColor(colors[0]);
        const colorB = parseHexColor(colors[1]);
        const colorC = parseHexColor(colors[2]);

        const resize = () => {
          if (!context || !device) return;
          const rect = wrapper.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const width = Math.max(1, Math.round(rect.width * dpr));
          const height = Math.max(1, Math.round(rect.height * dpr));
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }
          if (!contextConfigured) {
            context.configure({ device, format, alphaMode: "premultiplied" });
            contextConfigured = true;
          }
        };

        const draw = (now: number) => {
          frame = 0;
          if (disposed || !device || !context || !uniformBuffer) return;
          resize();
          const delta = Math.min(50, Math.max(0, now - lastTime));
          lastTime = now;
          if (!paused && !reducedMotion) elapsed += delta / 1000;
          smoothPointerX += (pointerX - smoothPointerX) * (reducedMotion ? 1 : 0.07);
          smoothPointerY += (pointerY - smoothPointerY) * (reducedMotion ? 1 : 0.07);
          const values = new Float32Array([
            canvas.width, canvas.height,
            smoothPointerX, smoothPointerY,
            elapsed, scrollProgress, clamp(intensity, 0, 3), reducedMotion ? 0 : 1,
            ...colorA, 1,
            ...colorB, 1,
            ...colorC, 1,
          ]);
          device.queue.writeBuffer(uniformBuffer, 0, values);
          const encoder = device.createCommandEncoder();
          const pass = encoder.beginRenderPass({
            colorAttachments: [{
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0.008, g: 0.012, b: 0.03, a: 1 },
              loadOp: "clear",
              storeOp: "store",
            }],
          });
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
          pass.draw(3);
          pass.end();
          device.queue.submit([encoder.finish()]);
          if (!paused && !reducedMotion) frame = window.requestAnimationFrame(draw);
        };

        const requestDraw = () => {
          if (!frame) frame = window.requestAnimationFrame(draw);
        };
        const onPointerMove = (event: PointerEvent) => {
          const rect = wrapper.getBoundingClientRect();
          pointerX = clamp((event.clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
          pointerY = clamp((event.clientY - rect.top) / Math.max(rect.height, 1), 0, 1);
          requestDraw();
        };
        const onPointerLeave = () => {
          pointerX = 0.5;
          pointerY = 0.5;
          requestDraw();
        };
        const onScroll = () => {
          const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          scrollProgress = clamp(window.scrollY / range, 0, 1);
          requestDraw();
        };
        const onMotionChange = (event: MediaQueryListEvent) => {
          reducedMotion = event.matches;
          if (frame) window.cancelAnimationFrame(frame);
          frame = 0;
          requestDraw();
        };

        resizeObserver = new ResizeObserver(requestDraw);
        resizeObserver.observe(wrapper);
        wrapper.addEventListener("pointermove", onPointerMove, { passive: true });
        wrapper.addEventListener("pointerleave", onPointerLeave, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        reducedQuery.addEventListener("change", onMotionChange);
        removeRuntimeListeners = () => {
          wrapper.removeEventListener("pointermove", onPointerMove);
          wrapper.removeEventListener("pointerleave", onPointerLeave);
          window.removeEventListener("scroll", onScroll);
          reducedQuery.removeEventListener("change", onMotionChange);
        };
        onScroll();
        window.clearTimeout(fallbackTimer);
        reportStatus("webgpu");
        requestDraw();

        device.lost.then(() => {
          if (!disposed) fallBack();
        }).catch(() => {
          if (!disposed) fallBack();
        });
      } catch {
        fallBack();
      }
    };

    fallbackTimer = window.setTimeout(fallBack, 2200);
    void initialize();
    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      removeRuntimeListeners();
      context?.unconfigure?.();
      uniformBuffer?.destroy();
      device?.destroy?.();
    };
  }, [colors, intensity, paused, reportStatus]);

  return (
    <div
      ref={wrapperRef}
      className={`kinetic-engine kinetic-engine--prism ${className}`.trim()}
      data-engine-status={status}
      style={mergeStyles(style)}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        tabIndex={-1}
        style={{ ...canvasStyle, opacity: useFallback ? 0 : 1 }}
      />
      {useFallback ? (
        <WebGLField
          mode="morph"
          paused={paused}
          intensity={intensity}
          colors={colors}
          onStatusChange={reportStatus}
          style={{ position: "absolute", inset: 0, minHeight: 0 }}
        />
      ) : null}
      {showBadge ? <EngineStatusBadge status={status} /> : null}
    </div>
  );
}
