uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uBloomIntensity;
uniform float uBloomThreshold;

varying vec2 vUv;

// Simple box blur for bloom effect
vec3 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec3 color = vec3(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv).rgb * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)).rgb * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)).rgb * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)).rgb * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)).rgb * 0.0702702703;
  return color;
}

void main() {
  vec3 color = texture2D(uTexture, vUv).rgb;

  // Extract bright areas
  float brightness = max(max(color.r, color.g), color.b);
  vec3 bloom = vec3(0.0);

  if (brightness > uBloomThreshold) {
    // Horizontal and vertical blur
    vec3 blurH = blur9(uTexture, vUv, uResolution, vec2(1.0, 0.0));
    vec3 blurV = blur9(uTexture, vUv, uResolution, vec2(0.0, 1.0));
    bloom = (blurH + blurV) * 0.5;
  }

  // Combine original with bloom
  vec3 result = color + bloom * uBloomIntensity;

  gl_FragColor = vec4(result, 1.0);
}
