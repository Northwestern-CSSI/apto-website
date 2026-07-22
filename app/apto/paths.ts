const deploymentBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const routeBase = process.env.NEXT_PUBLIC_APTO_ROUTE_BASE ?? "/apto";

export function withDeploymentBase(path: string) {
  if (!path.startsWith("/") || !deploymentBasePath) return path;
  if (path === deploymentBasePath || path.startsWith(`${deploymentBasePath}/`)) return path;
  return `${deploymentBasePath}${path}`;
}

export function aptoRoute(path = "") {
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;
  const localPath = `${routeBase}${normalizedPath}` || "/";
  return withDeploymentBase(localPath);
}

