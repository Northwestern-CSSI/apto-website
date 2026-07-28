# Vivid gradient icon theme

This file preserves the original vivid APTO piece-icon treatment so it can be
restored without reconstructing the palette or tile effects.

## SVG palette

- Cyan: `#67E0EF`
- Purple: `#9C8CF4`
- Gold: `#F3C751`
- Standard stroke: `3.2`
- Standard line caps and joins: `round`

```svg
<linearGradient id="g" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
  <stop stop-color="#67E0EF"/>
  <stop offset=".53" stop-color="#9C8CF4"/>
  <stop offset="1" stop-color="#F3C751"/>
</linearGradient>
```

## Tile effects

```css
.apto-resource-thumb {
  background:
    radial-gradient(circle at 24% 18%, rgb(103 224 239 / 20%), transparent 46%),
    linear-gradient(145deg, rgb(9 37 60 / 92%), rgb(13 24 55 / 94%));
}

.apto-resource-route > li:nth-child(4n + 2) .apto-resource-thumb {
  background:
    radial-gradient(circle at 76% 18%, rgb(243 199 81 / 20%), transparent 45%),
    linear-gradient(145deg, rgb(24 31 65 / 92%), rgb(8 41 58 / 95%));
}

.apto-resource-route > li:nth-child(4n + 3) .apto-resource-thumb {
  background:
    radial-gradient(circle at 22% 82%, rgb(156 140 244 / 24%), transparent 46%),
    linear-gradient(145deg, rgb(8 43 58 / 94%), rgb(25 25 62 / 94%));
}

.apto-resource-route > li:nth-child(4n + 4) .apto-resource-thumb {
  background:
    radial-gradient(circle at 78% 76%, rgb(103 224 239 / 18%), transparent 47%),
    linear-gradient(145deg, rgb(31 29 62 / 94%), rgb(7 35 54 / 95%));
}
```

The current live theme uses the same geometry with quieter blue, slate, and
sand tones. This archived recipe affects color only, not icon meaning or shape.
