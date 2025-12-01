precision highp float;

uniform vec2 uResolution;
uniform vec3 uCameraPos;
uniform vec3 uCameraTarget;
uniform float uTime;
uniform int uFractalType; // 0: Mandelbulb, 1: Mandelbox, 2: Menger Sponge, 3: Julia Set
uniform float uPower; // For Mandelbulb
uniform float uScale; // For Mandelbox
uniform float uFoldingLimit; // For Mandelbox
uniform vec3 uColorLow;
uniform vec3 uColorHigh;
uniform float uGlow;
uniform int uMaxIterations;
uniform float uBailout;

varying vec2 vUv;

const int MAX_STEPS = 128;
const int MAX_FRACTAL_ITERATIONS = 30;
const float MAX_DIST = 100.0;
const float SURF_DIST = 0.001;

// Mandelbulb distance estimator
float mandelbulbDE(vec3 pos, float power) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;

    for (int i = 0; i < MAX_FRACTAL_ITERATIONS; i++) {
        if (i >= uMaxIterations) break;
        r = length(z);
        if (r > 2.0) break;

        // Convert to polar coordinates
        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, power - 1.0) * power * dr + 1.0;

        // Scale and rotate the point
        float zr = pow(r, power);
        theta = theta * power;
        phi = phi * power;

        // Convert back to cartesian coordinates
        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += pos;
    }

    return 0.5 * log(r) * r / dr;
}

// Mandelbox distance estimator
float mandelboxDE(vec3 pos, float scale, float foldLimit) {
    vec3 z = pos;
    float dr = 1.0;
    float r;

    for (int i = 0; i < MAX_FRACTAL_ITERATIONS; i++) {
        if (i >= uMaxIterations) break;
        // Box fold
        z = clamp(z, -foldLimit, foldLimit) * 2.0 - z;

        // Sphere fold
        r = dot(z, z);
        if (r < 0.5) {
            z *= 4.0;
            dr *= 4.0;
        } else if (r < 1.0) {
            z /= r;
            dr /= r;
        }

        // Scale and translate
        z = z * scale + pos;
        dr = dr * abs(scale) + 1.0;
    }

    return length(z) / abs(dr);
}

// Menger Sponge distance estimator
float mengerSpongeDE(vec3 p) {
    float d = 1e10;
    vec3 z = p;
    float scale = 1.0;

    for (int i = 0; i < 4; i++) {
        vec3 a = mod(z * scale, 2.0) - 1.0;
        scale *= 3.0;
        vec3 r = abs(1.0 - 3.0 * abs(a));

        float da = max(r.x, r.y);
        float db = max(r.y, r.z);
        float dc = max(r.z, r.x);
        float c = (min(da, min(db, dc)) - 1.0) / scale;

        d = max(d, c);
    }

    return d;
}

// 3D Julia Set distance estimator
float juliaDE(vec3 pos, vec3 c) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;

    for (int i = 0; i < MAX_FRACTAL_ITERATIONS; i++) {
        if (i >= uMaxIterations) break;
        r = length(z);
        if (r > 2.0) break;

        // Quaternion-like multiplication
        float x2 = z.x * z.x;
        float y2 = z.y * z.y;
        float z2 = z.z * z.z;

        dr = 2.0 * r * dr + 1.0;

        z = vec3(
            x2 - y2 - z2,
            2.0 * z.x * z.y,
            2.0 * z.x * z.z
        ) + c;
    }

    return 0.5 * log(r) * r / dr;
}

// Get distance based on fractal type
float getDist(vec3 p) {
    if (uFractalType == 0) {
        return mandelbulbDE(p, uPower);
    } else if (uFractalType == 1) {
        return mandelboxDE(p, uScale, uFoldingLimit);
    } else if (uFractalType == 2) {
        return mengerSpongeDE(p);
    } else {
        vec3 c = vec3(0.3, 0.5, 0.4) + 0.1 * sin(uTime * 0.5);
        return juliaDE(p, c);
    }
}

// Estimate normal using gradient
vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    float d = getDist(p);
    vec3 n = d - vec3(
        getDist(p - e.xyy),
        getDist(p - e.yxy),
        getDist(p - e.yyx)
    );
    return normalize(n);
}

// Raymarch
float raymarch(vec3 ro, vec3 rd, out int steps) {
    float dO = 0.0;
    steps = 0;

    for (int i = 0; i < MAX_STEPS; i++) {
        steps = i;
        vec3 p = ro + rd * dO;
        float dS = getDist(p);
        dO += dS;
        if (dO > MAX_DIST || abs(dS) < SURF_DIST) break;
    }

    return dO;
}

// Get camera ray direction
vec3 getRayDir(vec2 uv, vec3 camPos, vec3 lookAt, float zoom) {
    vec3 f = normalize(lookAt - camPos);
    vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
    vec3 u = cross(f, r);
    vec3 c = camPos + f * zoom;
    vec3 i = c + uv.x * r + uv.y * u;
    return normalize(i - camPos);
}

void main() {
    // UV coordinates from -1 to 1, aspect ratio corrected
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uResolution.x / uResolution.y;

    // Camera
    vec3 ro = uCameraPos;
    vec3 rd = getRayDir(uv, uCameraPos, uCameraTarget, 1.0);

    // Raymarch
    int steps;
    float d = raymarch(ro, rd, steps);

    vec3 col = vec3(0.0);

    if (d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 n = getNormal(p);

        // Lighting
        vec3 lightPos = uCameraPos + vec3(2.0, 3.0, 1.0);
        vec3 lightDir = normalize(lightPos - p);

        // Diffuse
        float diff = max(dot(n, lightDir), 0.0);

        // Specular
        vec3 reflectDir = reflect(-lightDir, n);
        float spec = pow(max(dot(rd, reflectDir), 0.0), 32.0);

        // Ambient occlusion (based on steps)
        float ao = 1.0 - float(steps) / float(MAX_STEPS);
        ao = pow(ao, 2.0);

        // Color based on distance and normal
        float colorMix = (p.y + 1.0) * 0.5;
        vec3 baseColor = mix(uColorLow, uColorHigh, colorMix);

        // Combine lighting
        vec3 ambient = baseColor * 0.3;
        vec3 diffuse = baseColor * diff * 0.6;
        vec3 specular = vec3(1.0) * spec * 0.5;

        col = (ambient + diffuse + specular) * ao;

        // Glow effect
        if (uGlow > 0.0) {
            float glow = float(steps) / float(MAX_STEPS);
            col += uGlow * glow * mix(uColorLow, uColorHigh, 0.5);
        }
    } else {
        // Background gradient
        float gradient = smoothstep(-1.0, 1.0, uv.y);
        col = mix(uColorLow * 0.2, uColorHigh * 0.2, gradient);

        // Add glow for rays that don't hit
        if (uGlow > 0.0) {
            float glow = float(steps) / float(MAX_STEPS);
            col += uGlow * 0.3 * glow * mix(uColorLow, uColorHigh, 0.5);
        }
    }

    // Gamma correction
    col = pow(col, vec3(0.4545));

    gl_FragColor = vec4(col, 1.0);
}
