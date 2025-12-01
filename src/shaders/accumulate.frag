varying vec3 vColor;

void main() {
  // Each point adds to the density histogram
  // Use per-point color if available, otherwise white
  gl_FragColor = vec4(vColor, 1.0);
}
