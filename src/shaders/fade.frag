uniform sampler2D uTexture;
uniform float uDecay;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(uTexture, vUv);
  gl_FragColor = vec4(color.rgb * uDecay, color.a);
}
