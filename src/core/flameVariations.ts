/**
 * Fractal Flame Variations Library
 *
 * Each variation is a non-linear function V(x, y) -> (x', y')
 * These are applied after the affine transformation to create
 * organic, flowing patterns characteristic of fractal flames.
 */

import { VariationType, WeightedVariation } from './types';

// Helper functions
const EPS = 1e-10;

function r(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function r2(x: number, y: number): number {
  return x * x + y * y;
}

function theta(x: number, y: number): number {
  return Math.atan2(y, x);
}

// Random number for stochastic variations
function psi(): number {
  return Math.random();
}

function omega(): number {
  return Math.random() < 0.5 ? 0 : Math.PI;
}

/**
 * Apply a single variation function
 */
function applyVariation(
  type: VariationType,
  x: number,
  y: number,
  params?: Record<string, number>
): [number, number] {
  const rVal = r(x, y);
  const r2Val = r2(x, y);
  const thetaVal = theta(x, y);

  switch (type) {
    case VariationType.Linear:
      // V0: Linear (identity)
      return [x, y];

    case VariationType.Sinusoidal:
      // V1: Sinusoidal
      return [Math.sin(x), Math.sin(y)];

    case VariationType.Spherical:
      // V2: Spherical (inversion)
      const invR2 = 1 / (r2Val + EPS);
      return [x * invR2, y * invR2];

    case VariationType.Swirl:
      // V3: Swirl
      const sinR2 = Math.sin(r2Val);
      const cosR2 = Math.cos(r2Val);
      return [x * sinR2 - y * cosR2, x * cosR2 + y * sinR2];

    case VariationType.Horseshoe:
      // V4: Horseshoe
      const invR = 1 / (rVal + EPS);
      return [invR * (x - y) * (x + y), invR * 2 * x * y];

    case VariationType.Polar:
      // V5: Polar
      return [thetaVal / Math.PI, rVal - 1];

    case VariationType.Handkerchief:
      // V6: Handkerchief
      return [
        rVal * Math.sin(thetaVal + rVal),
        rVal * Math.cos(thetaVal - rVal)
      ];

    case VariationType.Heart:
      // V7: Heart
      return [
        rVal * Math.sin(thetaVal * rVal),
        -rVal * Math.cos(thetaVal * rVal)
      ];

    case VariationType.Disc:
      // V8: Disc
      const thetaPi = thetaVal / Math.PI;
      return [
        thetaPi * Math.sin(Math.PI * rVal),
        thetaPi * Math.cos(Math.PI * rVal)
      ];

    case VariationType.Spiral:
      // V9: Spiral
      const invR3 = 1 / (rVal + EPS);
      return [
        invR3 * (Math.cos(thetaVal) + Math.sin(rVal)),
        invR3 * (Math.sin(thetaVal) - Math.cos(rVal))
      ];

    case VariationType.Hyperbolic:
      // V10: Hyperbolic
      return [
        Math.sin(thetaVal) / (rVal + EPS),
        rVal * Math.cos(thetaVal)
      ];

    case VariationType.Diamond:
      // V11: Diamond
      return [
        Math.sin(thetaVal) * Math.cos(rVal),
        Math.cos(thetaVal) * Math.sin(rVal)
      ];

    case VariationType.Ex:
      // V12: Ex
      const p0 = Math.sin(thetaVal + rVal);
      const p1 = Math.cos(thetaVal - rVal);
      const p0_3 = p0 * p0 * p0;
      const p1_3 = p1 * p1 * p1;
      return [
        rVal * (p0_3 + p1_3),
        rVal * (p0_3 - p1_3)
      ];

    case VariationType.Julia:
      // V13: Julia
      const sqrtR = Math.sqrt(rVal);
      const omegaVal = omega();
      return [
        sqrtR * Math.cos(thetaVal / 2 + omegaVal),
        sqrtR * Math.sin(thetaVal / 2 + omegaVal)
      ];

    case VariationType.Bent:
      // V14: Bent
      if (x >= 0 && y >= 0) return [x, y];
      if (x < 0 && y >= 0) return [2 * x, y];
      if (x >= 0 && y < 0) return [x, y / 2];
      return [2 * x, y / 2];

    case VariationType.Waves:
      // V15: Waves (needs params b, c, e, f)
      const b = params?.b ?? 1;
      const c = params?.c ?? 1;
      const e = params?.e ?? 0.1;
      const f = params?.f ?? 0.1;
      return [
        x + b * Math.sin(y / (c * c + EPS)),
        y + e * Math.sin(x / (f * f + EPS))
      ];

    case VariationType.Fisheye:
      // V16: Fisheye
      const fishR = 2 / (rVal + 1);
      return [fishR * y, fishR * x];

    case VariationType.Popcorn:
      // V17: Popcorn (needs params c, f)
      const pc = params?.c ?? 0.5;
      const pf = params?.f ?? 0.5;
      return [
        x + pc * Math.sin(Math.tan(3 * y)),
        y + pf * Math.sin(Math.tan(3 * x))
      ];

    case VariationType.Exponential:
      // V18: Exponential
      const expX = Math.exp(x - 1);
      return [
        expX * Math.cos(Math.PI * y),
        expX * Math.sin(Math.PI * y)
      ];

    case VariationType.Power:
      // V19: Power
      const powR = Math.pow(rVal, Math.sin(thetaVal));
      return [
        powR * Math.cos(thetaVal),
        powR * Math.sin(thetaVal)
      ];

    case VariationType.Cosine:
      // V20: Cosine
      return [
        Math.cos(Math.PI * x) * Math.cosh(y),
        -Math.sin(Math.PI * x) * Math.sinh(y)
      ];

    case VariationType.Rings:
      // V21: Rings (needs param c)
      const rc = params?.c ?? 0.5;
      const rc2 = rc * rc + EPS;
      const ringsVal = ((rVal + rc2) % (2 * rc2)) - rc2 + rVal * (1 - rc2);
      return [
        ringsVal * Math.cos(thetaVal),
        ringsVal * Math.sin(thetaVal)
      ];

    case VariationType.Fan:
      // V22: Fan (needs params c, f)
      const fc = params?.c ?? 0.5;
      const ff = params?.f ?? 0.5;
      const ft = Math.PI * fc * fc + EPS;
      const fanTheta = thetaVal + ff - ft * Math.floor(2 * thetaVal * ff / ft);
      if (fanTheta > ft / 2) {
        return [rVal * Math.cos(thetaVal - ft / 2), rVal * Math.sin(thetaVal - ft / 2)];
      }
      return [rVal * Math.cos(thetaVal + ft / 2), rVal * Math.sin(thetaVal + ft / 2)];

    case VariationType.Blob:
      // V23: Blob (needs params high, low, waves)
      const blobHigh = params?.high ?? 1;
      const blobLow = params?.low ?? 0.5;
      const blobWaves = params?.waves ?? 5;
      const blobR = rVal * (blobLow + (blobHigh - blobLow) * (0.5 + 0.5 * Math.sin(blobWaves * thetaVal)));
      return [
        blobR * Math.cos(thetaVal),
        blobR * Math.sin(thetaVal)
      ];

    case VariationType.PDJ:
      // V24: PDJ (needs params a, b, c, d)
      const pa = params?.a ?? 1;
      const pb = params?.b ?? 1;
      const pdc = params?.c ?? 1;
      const pd = params?.d ?? 1;
      return [
        Math.sin(pa * y) - Math.cos(pb * x),
        Math.sin(pdc * x) - Math.cos(pd * y)
      ];

    case VariationType.Fan2:
      // V25: Fan2 (needs params x, y)
      const f2x = params?.x ?? 0.5;
      const f2y = params?.y ?? 0.5;
      const f2p1 = Math.PI * f2x * f2x + EPS;
      const f2p2 = f2y;
      const f2t = thetaVal + f2p2 - f2p1 * Math.floor(2 * thetaVal * f2p2 / f2p1);
      if (f2t > f2p1 / 2) {
        return [rVal * Math.sin(thetaVal - f2p1 / 2), rVal * Math.cos(thetaVal - f2p1 / 2)];
      }
      return [rVal * Math.sin(thetaVal + f2p1 / 2), rVal * Math.cos(thetaVal + f2p1 / 2)];

    case VariationType.Rings2:
      // V26: Rings2 (needs param val)
      const r2v = params?.val ?? 0.5;
      const r2p = r2v * r2v + EPS;
      const r2t = rVal - 2 * r2p * Math.floor((rVal + r2p) / (2 * r2p)) + rVal * (1 - r2p);
      return [
        r2t * Math.cos(thetaVal),
        r2t * Math.sin(thetaVal)
      ];

    case VariationType.Eyefish:
      // V27: Eyefish
      const eyeR = 2 / (rVal + 1);
      return [eyeR * x, eyeR * y];

    case VariationType.Bubble:
      // V28: Bubble
      const bubbleR = 4 / (r2Val + 4);
      return [bubbleR * x, bubbleR * y];

    case VariationType.Cylinder:
      // V29: Cylinder
      return [Math.sin(x), y];

    case VariationType.Tangent:
      // V30: Tangent
      return [
        Math.sin(x) / (Math.cos(y) + EPS),
        Math.tan(y)
      ];

    case VariationType.Cross:
      // V31: Cross
      const crossSq = (x * x - y * y);
      const crossVal = Math.sqrt(1 / (crossSq * crossSq + EPS));
      return [crossVal * x, crossVal * y];

    case VariationType.Noise:
      // V32: Noise
      const noisePsi1 = psi();
      const noisePsi2 = psi();
      return [
        noisePsi1 * x * Math.cos(2 * Math.PI * noisePsi2),
        noisePsi1 * y * Math.sin(2 * Math.PI * noisePsi2)
      ];

    case VariationType.Curl:
      // V33: Curl (needs params c1, c2)
      const curlC1 = params?.c1 ?? 0.5;
      const curlC2 = params?.c2 ?? 0;
      const curlT1 = 1 + curlC1 * x + curlC2 * (x * x - y * y);
      const curlT2 = curlC1 * y + 2 * curlC2 * x * y;
      const curlR = 1 / (curlT1 * curlT1 + curlT2 * curlT2 + EPS);
      return [
        curlR * (x * curlT1 + y * curlT2),
        curlR * (y * curlT1 - x * curlT2)
      ];

    case VariationType.Rectangles:
      // V34: Rectangles (needs params x, y)
      const rectX = params?.x ?? 1;
      const rectY = params?.y ?? 1;
      return [
        (2 * Math.floor(x / rectX) + 1) * rectX - x,
        (2 * Math.floor(y / rectY) + 1) * rectY - y
      ];

    case VariationType.Arch:
      // V35: Arch
      const archPsi = psi();
      const archSin = Math.sin(archPsi * Math.PI);
      return [
        Math.sin(archPsi * Math.PI),
        archSin * archSin / (Math.cos(archPsi * Math.PI) + EPS)
      ];

    default:
      return [x, y];
  }
}

/**
 * Apply weighted combination of variations
 */
export function applyVariations(
  x: number,
  y: number,
  variations: WeightedVariation[]
): [number, number] {
  let outX = 0;
  let outY = 0;

  for (const v of variations) {
    const [vx, vy] = applyVariation(v.type, x, y, v.params);
    outX += v.weight * vx;
    outY += v.weight * vy;
  }

  return [outX, outY];
}

/**
 * Apply affine transformation
 * coefs = [a, b, c, d, e, f]
 * x' = a*x + b*y + e
 * y' = c*x + d*y + f
 */
export function applyAffine(
  x: number,
  y: number,
  coefs: [number, number, number, number, number, number]
): [number, number] {
  const [a, b, c, d, e, f] = coefs;
  return [
    a * x + b * y + e,
    c * x + d * y + f
  ];
}
