uniform float uZoom;
uniform vec2 uPan;

attribute vec3 color;
varying vec3 vColor;

void main() {
  // Apply zoom and pan transformation
  vec2 transformed = (position.xy - uPan) * uZoom;

  gl_Position = vec4(transformed, 0.0, 1.0);

  // Keep point size at 1px for clean rendering
  // (When using adaptive detail, point density increases instead of point size)
  gl_PointSize = 1.0;

  // Pass color to fragment shader (default to white if not provided)
  vColor = color.x > 0.0 || color.y > 0.0 || color.z > 0.0 ? color : vec3(1.0);
}
