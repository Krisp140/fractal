import { Fractal3D, Fractal3DType } from './types';

export const mandelbulb: Fractal3D = {
  name: 'Mandelbulb',
  type: Fractal3DType.Mandelbulb,
  power: 8.0,
  defaultCameraPos: [0, 0, 3],
  defaultCameraTarget: [0, 0, 0],
};

export const mandelbox: Fractal3D = {
  name: 'Mandelbox',
  type: Fractal3DType.Mandelbox,
  scale: 2.0,
  foldingLimit: 1.0,
  defaultCameraPos: [3, 2, 3],
  defaultCameraTarget: [0, 0, 0],
};

export const mengerSponge: Fractal3D = {
  name: 'Menger Sponge',
  type: Fractal3DType.MengerSponge,
  defaultCameraPos: [2, 2, 2],
  defaultCameraTarget: [0, 0, 0],
};

export const juliaSet3D: Fractal3D = {
  name: '3D Julia Set',
  type: Fractal3DType.JuliaSet,
  defaultCameraPos: [0, 0, 3],
  defaultCameraTarget: [0, 0, 0],
};

export const presets3D: Fractal3D[] = [
  mandelbulb,
  mandelbox,
  mengerSponge,
  juliaSet3D,
];

export const defaultPreset3D = mandelbulb;
