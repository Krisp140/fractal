uniform sampler2D uAccumTexture;
uniform float uBrightness;
uniform vec3 uColorLow;
uniform vec3 uColorHigh;
uniform float uBloomIntensity;
uniform float uBloomThreshold;
uniform vec2 uResolution;
uniform float uRotation;
uniform bool uKaleidoscope;
uniform float uKaleidoscopeSegments;
uniform float uChromaticAberration;

varying vec2 vUv;

// Rotation matrix
vec2 rotate(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(
    uv.x * c - uv.y * s,
    uv.x * s + uv.y * c
  );
}

// Kaleidoscope effect
vec2 kaleidoscope(vec2 uv, float segments) {
  vec2 centered = uv - 0.5;
  float angle = atan(centered.y, centered.x);
  float radius = length(centered);

  float segmentAngle = 6.28318530718 / segments;
  angle = mod(angle, segmentAngle);

  if (mod(floor(atan(centered.y, centered.x) / segmentAngle), 2.0) == 1.0) {
    angle = segmentAngle - angle;
  }

  return vec2(cos(angle), sin(angle)) * radius + 0.5;
}

// Simple bloom blur
vec3 sampleBlur(vec2 uv) {
  vec3 color = vec3(0.0);
  float total = 0.0;

  for (float x = -2.0; x <= 2.0; x++) {
    for (float y = -2.0; y <= 2.0; y++) {
      vec2 offset = vec2(x, y) / uResolution;
      float weight = 1.0 - length(vec2(x, y)) / 4.0;
      color += texture2D(uAccumTexture, uv + offset).rgb * weight;
      total += weight;
    }
  }

  return color / total;
}

void main() {
  // Apply transformations to UV
  vec2 uv = vUv;

  // Apply rotation
  if (uRotation != 0.0) {
    vec2 centered = uv - 0.5;
    centered = rotate(centered, uRotation);
    uv = centered + 0.5;
  }

  // Apply kaleidoscope
  if (uKaleidoscope) {
    uv = kaleidoscope(uv, uKaleidoscopeSegments);
  }

  // Sample the accumulated density/color with chromatic aberration
  vec4 accum;
  if (uChromaticAberration > 0.0) {
    // Calculate radial offset from center
    vec2 centered = uv - 0.5;
    vec2 direction = normalize(centered);
    float distance = length(centered);

    // Sample each channel at different offsets (radial)
    float offset = uChromaticAberration * distance * 0.01;
    vec2 uvR = uv + direction * offset;
    vec2 uvG = uv;
    vec2 uvB = uv - direction * offset;

    float r = texture2D(uAccumTexture, uvR).r;
    float g = texture2D(uAccumTexture, uvG).g;
    float b = texture2D(uAccumTexture, uvB).b;
    float a = texture2D(uAccumTexture, uvG).a;

    accum = vec4(r, g, b, a);
  } else {
    accum = texture2D(uAccumTexture, uv);
  }

  // Calculate total density from all channels
  float d = max(max(accum.r, accum.g), accum.b);

  if (d < 0.001) {
    // Background
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    // If colors are present (RGB channels differ), use them directly
    bool hasColor = abs(accum.r - accum.g) > 0.01 || abs(accum.g - accum.b) > 0.01;

    vec3 color;
    if (hasColor) {
      // Use accumulated colors with tone mapping
      color = log(vec3(1.0) + accum.rgb * uBrightness) / log(1.0 + uBrightness);
    } else {
      // Monochrome - use gradient
      float logDensity = log(1.0 + d * uBrightness) / log(1.0 + uBrightness);
      color = mix(uColorLow, uColorHigh, logDensity);
    }

    // Add bloom if intensity > 0
    if (uBloomIntensity > 0.0) {
      float brightness = max(max(color.r, color.g), color.b);
      if (brightness > uBloomThreshold) {
        vec3 bloom = sampleBlur(uv);
        color += bloom * uBloomIntensity * (brightness - uBloomThreshold);
      }
    }

    gl_FragColor = vec4(color, 1.0);
  }
}
