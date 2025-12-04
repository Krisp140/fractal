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

// NEW PSYCHEDELIC UNIFORMS
uniform float uTime;
uniform float uSpiralDistortion;
uniform float uRadialPulse;
uniform float uWaveDistortion;
uniform float uTunnelEffect;
uniform float uPrismEffect;
uniform float uMirrorDimensions;
uniform float uColorShift;
uniform float uInvertPulse;
uniform float uEdgeGlow;
uniform float uFractalNoise;
uniform float uKaleidoscopeRotation;
uniform float uFeedbackZoom;
uniform float uRipple;
uniform float uPixelate;
uniform float uPosterize;
uniform int uBackgroundMode;  // 0=simple, 1=plasma, 2=flow, 3=geometry, 4=starfield, 5=nebula

varying vec2 vUv;

#define PI 3.14159265359
#define TAU 6.28318530718

// ============================================
// NOISE FUNCTIONS
// ============================================

// Simple hash function
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value;
}

// ============================================
// BACKGROUND EFFECTS
// ============================================

// Plasma effect - classic lava lamp
vec3 plasmaBackground(vec2 uv, float time) {
  float v1 = sin(uv.x * 5.0 + time * 0.3);
  float v2 = sin(uv.y * 5.0 + time * 0.4);
  float v3 = sin((uv.x + uv.y) * 5.0 + time * 0.2);
  float v4 = sin(length(uv - 0.5) * 8.0 - time * 0.5);

  float v = (v1 + v2 + v3 + v4) * 0.25;

  // Create RGB from different phases
  vec3 color = vec3(
    sin(v * PI + time * 0.1) * 0.5 + 0.5,
    sin(v * PI + time * 0.15 + 2.094) * 0.5 + 0.5,
    sin(v * PI + time * 0.12 + 4.188) * 0.5 + 0.5
  );

  return color * 0.4;  // Keep it subtle
}

// Flow field - organic flowing patterns
vec3 flowBackground(vec2 uv, float time) {
  vec2 p = uv * 3.0;

  // Multiple layers of flowing noise
  float n1 = fbm(p + time * 0.1);
  float n2 = fbm(p + vec2(n1) * 0.5 + time * 0.08);
  float n3 = fbm(p + vec2(n2) * 0.5 - time * 0.05);

  // Create flowing color
  vec3 color = vec3(
    n1 * 0.5 + 0.3,
    n2 * 0.4 + 0.2,
    n3 * 0.6 + 0.3
  );

  // Shift hue over time
  float hueShift = time * 0.05;
  color = vec3(
    color.r * cos(hueShift) - color.g * sin(hueShift),
    color.r * sin(hueShift) + color.g * cos(hueShift),
    color.b
  );

  return color * 0.35;
}

// Sacred geometry - rotating patterns
vec3 geometryBackground(vec2 uv, float time) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);
  float angle = atan(centered.y, centered.x);

  // Rotating flower of life pattern
  float petals = 6.0;
  float pattern = 0.0;

  for (float i = 0.0; i < 3.0; i++) {
    float a = angle + time * 0.1 * (i + 1.0) + i * 0.5;
    float r = dist * (3.0 + i);
    pattern += sin(a * petals + sin(r * 4.0 - time * 0.2)) * 0.3;
    pattern += sin(r * 8.0 - a * 3.0 + time * 0.15) * 0.2;
  }

  // Concentric rings
  pattern += sin(dist * 20.0 - time * 0.3) * 0.2;

  vec3 color = mix(
    vec3(0.1, 0.0, 0.2),  // Deep purple
    vec3(0.0, 0.3, 0.4),  // Teal
    pattern * 0.5 + 0.5
  );

  // Add golden ratio spirals
  float spiral = sin(log(dist + 0.1) * 5.0 + angle * 3.0 - time * 0.2);
  color += vec3(0.3, 0.2, 0.0) * spiral * 0.2;

  return color * 0.4;
}

// Starfield - twinkling stars
vec3 starfieldBackground(vec2 uv, float time) {
  vec3 color = vec3(0.02, 0.01, 0.05);  // Deep space

  // Multiple star layers at different depths
  for (float layer = 1.0; layer <= 3.0; layer++) {
    vec2 starUv = uv * (20.0 + layer * 15.0);
    vec2 starId = floor(starUv);
    vec2 starPos = fract(starUv) - 0.5;

    // Random star position within cell
    float rand = hash(starId);
    vec2 offset = vec2(hash(starId + 100.0), hash(starId + 200.0)) - 0.5;
    offset *= 0.8;

    float starDist = length(starPos - offset);

    // Twinkling
    float twinkle = sin(time * (2.0 + rand * 3.0) + rand * 10.0) * 0.5 + 0.5;
    twinkle = pow(twinkle, 2.0);

    // Star brightness
    float star = smoothstep(0.1, 0.0, starDist) * rand * twinkle;

    // Star color based on hash
    vec3 starColor = vec3(1.0);
    if (rand > 0.8) starColor = vec3(1.0, 0.8, 0.6);  // Warm
    if (rand > 0.9) starColor = vec3(0.6, 0.8, 1.0);  // Cool

    color += starColor * star * (0.3 / layer);
  }

  // Add subtle nebula glow
  float nebula = fbm(uv * 2.0 + time * 0.02);
  color += vec3(0.1, 0.0, 0.15) * nebula * 0.3;

  return color;
}

// Nebula - cosmic clouds
vec3 nebulaBackground(vec2 uv, float time) {
  vec2 p = uv * 2.0;

  // Layered nebula clouds
  float n1 = fbm(p + time * 0.03);
  float n2 = fbm(p * 2.0 - time * 0.02 + n1 * 0.5);
  float n3 = fbm(p * 0.5 + time * 0.01 + n2 * 0.3);

  // Create cosmic colors
  vec3 color1 = vec3(0.4, 0.0, 0.3);   // Magenta
  vec3 color2 = vec3(0.0, 0.2, 0.4);   // Blue
  vec3 color3 = vec3(0.3, 0.1, 0.0);   // Orange/brown
  vec3 color4 = vec3(0.0, 0.3, 0.2);   // Teal

  vec3 color = mix(color1, color2, n1);
  color = mix(color, color3, n2 * 0.5);
  color = mix(color, color4, n3 * 0.3);

  // Add bright spots
  float bright = pow(n1 * n2, 3.0);
  color += vec3(1.0, 0.8, 0.9) * bright * 0.5;

  // Subtle stars
  float stars = pow(hash(floor(uv * 100.0)), 20.0);
  color += vec3(1.0) * stars;

  return color * 0.35;
}

// Main background function
vec3 getBackground(vec2 uv, float time, vec3 colorLow, vec3 colorHigh) {
  if (uBackgroundMode == 1) {
    return plasmaBackground(uv, time);
  } else if (uBackgroundMode == 2) {
    return flowBackground(uv, time);
  } else if (uBackgroundMode == 3) {
    return geometryBackground(uv, time);
  } else if (uBackgroundMode == 4) {
    return starfieldBackground(uv, time);
  } else if (uBackgroundMode == 5) {
    return nebulaBackground(uv, time);
  } else {
    // Default simple background (mode 0)
    float bgNoise = fbm(uv * 3.0 + time * 0.02) * 0.5 + 0.5;
    float bgWave = sin(uv.x * 8.0 + time * 0.05) * cos(uv.y * 6.0 + time * 0.04) * 0.5 + 0.5;
    float bgPattern = mix(bgNoise, bgWave, 0.5);
    vec3 bgColor = mix(colorLow, colorHigh, bgPattern * 0.5);
    return bgColor * (0.2 + 0.08 * sin(time * 0.1));
  }
}

// ============================================
// DISTORTION FUNCTIONS
// ============================================

// Rotation matrix
vec2 rotate(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
}

// Spiral distortion - creates swirling vortex - SLOW AND DREAMY
vec2 spiralDistort(vec2 uv, float amount, float time) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);
  float angle = atan(centered.y, centered.x);

  // Slow spiral frequencies
  float spiral = amount * (
    sin(dist * 8.0 - time * 0.4) * 0.5 +
    sin(dist * 4.0 + time * 0.3) * 0.3 +
    cos(dist * 12.0 - time * 0.5) * 0.2
  );

  angle += spiral * (1.0 - dist); // Stronger in center

  return vec2(cos(angle), sin(angle)) * dist + 0.5;
}

// Radial breathing pulse - SLOW
vec2 radialPulse(vec2 uv, float amount, float time) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);

  // Slow breathing
  float pulse = 1.0 + amount * (
    sin(time * 0.3) * 0.3 +
    sin(time * 0.5) * 0.2 +
    sin(dist * 6.0 - time * 0.6) * 0.15
  );

  return centered * pulse + 0.5;
}

// Wave distortion - SLOW psychedelic waves
vec2 waveDistort(vec2 uv, float amount, float time) {
  vec2 wave = vec2(
    sin(uv.y * 12.0 + time * 0.3) * cos(uv.x * 8.0 + time * 0.2),
    cos(uv.x * 10.0 - time * 0.25) * sin(uv.y * 6.0 + time * 0.35)
  );

  // Slow noise-based distortion
  wave += vec2(
    sin(uv.y * 20.0 + time * 0.5 + noise(uv * 5.0) * 5.0),
    cos(uv.x * 18.0 - time * 0.4 + noise(uv * 4.0) * 5.0)
  ) * 0.3;

  return uv + wave * amount * 0.02;
}

// Tunnel/hyperbolic zoom effect - SLOW
vec2 tunnelEffect(vec2 uv, float amount, float time) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);
  float angle = atan(centered.y, centered.x);

  // Slow logarithmic spiral
  float tunnelDist = log(dist + 0.1) + time * amount * 0.1;

  // Slow rotation toward center
  angle += amount * (1.0 / (dist + 0.1)) * 0.1 * sin(time * 0.2);

  // Reconstruct with warped distance
  float newDist = exp(tunnelDist - time * amount * 0.1);
  newDist = mix(dist, newDist, amount);

  return vec2(cos(angle), sin(angle)) * newDist + 0.5;
}

// Ripple effect - SLOW concentric waves
vec2 rippleEffect(vec2 uv, float amount, float time) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);

  // Slow ripples
  float ripple1 = sin(dist * 20.0 - time * 0.8) * exp(-dist * 2.0);
  float ripple2 = sin(dist * 15.0 + time * 0.5) * exp(-dist * 1.5);
  float ripple3 = cos(dist * 25.0 - time * 1.0) * exp(-dist * 3.0);

  float totalRipple = (ripple1 + ripple2 * 0.5 + ripple3 * 0.3) * amount * 0.05;

  vec2 direction = normalize(centered + 0.001);
  return uv + direction * totalRipple;
}

// Prism/rainbow split effect - SLOW
vec3 prismEffect(sampler2D tex, vec2 uv, float amount, float time) {
  vec2 centered = uv - 0.5;
  float angle = atan(centered.y, centered.x) + time * 0.1;  // Slow rotation
  float dist = length(centered);

  // Split colors based on angle and distance
  vec2 redOffset = vec2(cos(angle), sin(angle)) * amount * 0.02 * dist;
  vec2 greenOffset = vec2(cos(angle + TAU/3.0), sin(angle + TAU/3.0)) * amount * 0.02 * dist;
  vec2 blueOffset = vec2(cos(angle + 2.0*TAU/3.0), sin(angle + 2.0*TAU/3.0)) * amount * 0.02 * dist;

  float r = texture2D(tex, uv + redOffset).r;
  float g = texture2D(tex, uv + greenOffset).g;
  float b = texture2D(tex, uv + blueOffset).b;

  return vec3(r, g, b);
}

// ============================================
// KALEIDOSCOPE VARIATIONS
// ============================================

// Standard kaleidoscope
vec2 kaleidoscope(vec2 uv, float segments, float rotation) {
  vec2 centered = uv - 0.5;
  centered = rotate(centered, rotation);

  float angle = atan(centered.y, centered.x);
  float radius = length(centered);

  float segmentAngle = TAU / segments;
  angle = mod(angle, segmentAngle);

  // Mirror alternating segments
  if (mod(floor((atan(centered.y, centered.x) + rotation) / segmentAngle), 2.0) == 1.0) {
    angle = segmentAngle - angle;
  }

  return vec2(cos(angle), sin(angle)) * radius + 0.5;
}

// Multi-layer kaleidoscope
vec2 hyperKaleidoscope(vec2 uv, float segments, float time) {
  vec2 result = uv;

  // Layer 1 - slow rotation
  result = kaleidoscope(result, segments, time * 0.2);

  // Layer 2 - different segment count, opposite rotation
  result = kaleidoscope(result, segments * 0.5 + 2.0, -time * 0.15);

  // Layer 3 - subtle inner kaleidoscope
  vec2 centered = result - 0.5;
  float dist = length(centered);
  if (dist < 0.3) {
    result = kaleidoscope(result, segments * 2.0, time * 0.3);
  }

  return result;
}

// ============================================
// COLOR MANIPULATION
// ============================================

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// RGB to HSV conversion
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Shift hue with time
vec3 shiftHue(vec3 color, float shift) {
  vec3 hsv = rgb2hsv(color);
  hsv.x = fract(hsv.x + shift);
  return hsv2rgb(hsv);
}

// Posterize colors
vec3 posterize(vec3 color, float levels) {
  return floor(color * levels) / levels;
}

// ============================================
// BLOOM
// ============================================

vec3 sampleBlur(sampler2D tex, vec2 uv, float intensity) {
  vec3 color = vec3(0.0);
  float total = 0.0;

  // Larger blur kernel for more glow
  for (float x = -3.0; x <= 3.0; x++) {
    for (float y = -3.0; y <= 3.0; y++) {
      vec2 offset = vec2(x, y) / uResolution * (1.0 + intensity);
      float weight = 1.0 - length(vec2(x, y)) / 5.0;
      weight = max(0.0, weight);
      color += texture2D(tex, uv + offset).rgb * weight;
      total += weight;
    }
  }

  return color / total;
}

// ============================================
// MAIN
// ============================================

void main() {
  vec2 uv = vUv;

  // ========== UV DISTORTIONS (order matters!) ==========

  // Tunnel effect - infinite zoom
  if (uTunnelEffect > 0.0) {
    uv = tunnelEffect(uv, uTunnelEffect, uTime);
  }

  // Spiral distortion
  if (uSpiralDistortion > 0.0) {
    uv = spiralDistort(uv, uSpiralDistortion, uTime);
  }

  // Wave distortion
  if (uWaveDistortion > 0.0) {
    uv = waveDistort(uv, uWaveDistortion, uTime);
  }

  // Radial pulse/breathing
  if (uRadialPulse > 0.0) {
    uv = radialPulse(uv, uRadialPulse, uTime);
  }

  // Ripple effect
  if (uRipple > 0.0) {
    uv = rippleEffect(uv, uRipple, uTime);
  }

  // Rotation
  if (uRotation != 0.0) {
    vec2 centered = uv - 0.5;
    centered = rotate(centered, uRotation);
    uv = centered + 0.5;
  }

  // Kaleidoscope (with optional rotation animation)
  if (uKaleidoscope) {
    if (uMirrorDimensions > 1.0) {
      // Hyper kaleidoscope mode
      uv = hyperKaleidoscope(uv, uKaleidoscopeSegments, uTime * uKaleidoscopeRotation);
    } else {
      uv = kaleidoscope(uv, uKaleidoscopeSegments, uTime * uKaleidoscopeRotation);
    }
  }

  // SLOW Feedback zoom effect (creates infinite recursion look)
  if (uFeedbackZoom > 0.0) {
    vec2 centered = uv - 0.5;
    float feedback = 1.0 + uFeedbackZoom * 0.1 * sin(uTime * 0.3);
    uv = centered * feedback + 0.5;
  }

  // SLOW Fractal noise displacement
  if (uFractalNoise > 0.0) {
    vec2 noiseOffset = vec2(
      fbm(uv * 3.0 + uTime * 0.08),
      fbm(uv * 3.0 + 100.0 + uTime * 0.08)
    ) - 0.5;
    uv += noiseOffset * uFractalNoise * 0.1;
  }

  // Pixelation effect
  if (uPixelate > 0.0) {
    float pixels = mix(uResolution.x, 32.0, uPixelate);
    uv = floor(uv * pixels) / pixels;
  }

  // ========== SAMPLE THE FRACTAL ==========

  vec4 accum;

  // Chromatic aberration with SLOW rotation
  if (uChromaticAberration > 0.0) {
    vec2 centered = uv - 0.5;
    vec2 direction = normalize(centered + 0.001);
    float distance = length(centered);

    // Slow rotating chromatic aberration
    float rotAngle = uTime * 0.08;
    vec2 redDir = rotate(direction, rotAngle);
    vec2 blueDir = rotate(direction, -rotAngle);

    float offset = uChromaticAberration * distance * 0.01;

    float r = texture2D(uAccumTexture, uv + redDir * offset).r;
    float g = texture2D(uAccumTexture, uv).g;
    float b = texture2D(uAccumTexture, uv + blueDir * offset).b;
    float a = texture2D(uAccumTexture, uv).a;

    accum = vec4(r, g, b, a);
  }
  // Prism effect (rainbow split)
  else if (uPrismEffect > 0.0) {
    vec3 prism = prismEffect(uAccumTexture, uv, uPrismEffect, uTime);
    accum = vec4(prism, texture2D(uAccumTexture, uv).a);
  }
  else {
    accum = texture2D(uAccumTexture, uv);
  }

  // ========== COLOR PROCESSING ==========

  float d = max(max(accum.r, accum.g), accum.b);

  // Always have some color - never pure black
  // Use a low threshold so sparse areas still show color
  float minDensity = 0.0001;
  float effectiveD = max(d, minDensity);

  if (d < 0.0001) {
    // Use the background effect system
    vec3 bgColor = getBackground(vUv, uTime, uColorLow, uColorHigh);

    // Add subtle shifting hue if color shift is enabled
    if (uColorShift > 0.0) {
      bgColor = shiftHue(bgColor, uTime * uColorShift * 0.01);
    }

    gl_FragColor = vec4(bgColor, 1.0);
  } else {
    // Determine if we have per-transform colors
    bool hasColor = abs(accum.r - accum.g) > 0.01 || abs(accum.g - accum.b) > 0.01;

    vec3 color;
    if (hasColor) {
      color = log(vec3(1.0) + accum.rgb * uBrightness) / log(1.0 + uBrightness);
    } else {
      float logDensity = log(1.0 + d * uBrightness) / log(1.0 + uBrightness);
      color = mix(uColorLow, uColorHigh, logDensity);
    }

    // ========== COLOR EFFECTS ==========

    // Hue shift over time
    if (uColorShift > 0.0) {
      color = shiftHue(color, uTime * uColorShift * 0.1);
    }

    // SLOW color inversion pulse
    if (uInvertPulse > 0.0) {
      float invert = sin(uTime * 0.4) * 0.5 + 0.5;
      invert = pow(invert, 3.0) * uInvertPulse; // Make it punchier
      color = mix(color, vec3(1.0) - color, invert);
    }

    // Posterize
    if (uPosterize > 0.0) {
      float levels = mix(256.0, 4.0, uPosterize);
      color = posterize(color, levels);
    }

    // ========== GLOW EFFECTS ==========

    // Edge glow
    if (uEdgeGlow > 0.0) {
      vec2 texel = 1.0 / uResolution;
      float edge = 0.0;

      // Sobel edge detection
      float tl = texture2D(uAccumTexture, uv + vec2(-texel.x, texel.y)).r;
      float t  = texture2D(uAccumTexture, uv + vec2(0.0, texel.y)).r;
      float tr = texture2D(uAccumTexture, uv + vec2(texel.x, texel.y)).r;
      float l  = texture2D(uAccumTexture, uv + vec2(-texel.x, 0.0)).r;
      float r  = texture2D(uAccumTexture, uv + vec2(texel.x, 0.0)).r;
      float bl = texture2D(uAccumTexture, uv + vec2(-texel.x, -texel.y)).r;
      float b  = texture2D(uAccumTexture, uv + vec2(0.0, -texel.y)).r;
      float br = texture2D(uAccumTexture, uv + vec2(texel.x, -texel.y)).r;

      float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
      float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;
      edge = sqrt(gx*gx + gy*gy);

      // SLOW pulsing edge glow
      float glowPulse = 0.5 + 0.5 * sin(uTime * 0.5);
      vec3 edgeColor = shiftHue(uColorHigh, uTime * 0.03);
      color += edgeColor * edge * uEdgeGlow * (0.5 + glowPulse * 0.5);
    }

    // Bloom
    if (uBloomIntensity > 0.0) {
      float brightness = max(max(color.r, color.g), color.b);
      if (brightness > uBloomThreshold) {
        vec3 bloom = sampleBlur(uAccumTexture, uv, uBloomIntensity);
        // Tone map bloom
        bloom = log(vec3(1.0) + bloom * uBrightness) / log(1.0 + uBrightness);
        bloom = shiftHue(bloom, uTime * 0.02); // Very slowly shift bloom color
        color += bloom * uBloomIntensity * (brightness - uBloomThreshold);
      }
    }

    // ========== FINAL TOUCHES ==========

    // Softer vignette - much less darkening
    vec2 vignetteUV = vUv - 0.5;
    float vignette = 1.0 - dot(vignetteUV, vignetteUV) * (0.2 + 0.1 * sin(uTime * 0.4));
    vignette = max(vignette, 0.5); // Never go below 50% brightness
    color *= vignette;

    // Boost overall brightness - no more darkness!
    color = color * 1.2 + 0.02; // Slight lift to shadows

    // Soft clamp - allow slight HDR glow
    color = clamp(color, 0.0, 1.2);
    color = color / (1.0 + color * 0.1); // Soft rolloff instead of hard clamp

    gl_FragColor = vec4(color, 1.0);
  }
}
