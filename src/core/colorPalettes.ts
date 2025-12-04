export interface ColorPalette {
  name: string;
  low: string;
  high: string;
}

export const colorPalettes: ColorPalette[] = [
  // Original palettes
  {
    name: "Fire",
    low: "#000000",
    high: "#ff4400",
  },
  {
    name: "Ice",
    low: "#001a33",
    high: "#00d9ff",
  },
  {
    name: "Rainbow",
    low: "#ff0080",
    high: "#00ffff",
  },
  {
    name: "Nebula",
    low: "#1a0033",
    high: "#ff6b35",
  },
  {
    name: "Sunset",
    low: "#0f0c29",
    high: "#ff512f",
  },
  {
    name: "Forest",
    low: "#002200",
    high: "#44ff44",
  },
  {
    name: "Purple Dream",
    low: "#0a0015",
    high: "#ff00ff",
  },
  {
    name: "Ocean",
    low: "#000428",
    high: "#004e92",
  },
  {
    name: "Lava",
    low: "#330000",
    high: "#ffaa00",
  },
  {
    name: "Midnight",
    low: "#000000",
    high: "#6600ff",
  },
  {
    name: "Golden",
    low: "#1a1000",
    high: "#ffd700",
  },
  {
    name: "Toxic",
    low: "#001a00",
    high: "#00ff00",
  },
  // Psychedelic palettes
  {
    name: "DMT",
    low: "#ff00ff",
    high: "#00ffff",
  },
  {
    name: "Ayahuasca",
    low: "#1a004d",
    high: "#00ff88",
  },
  {
    name: "Electric",
    low: "#0000ff",
    high: "#ff00ff",
  },
  {
    name: "Candy Flip",
    low: "#ff1493",
    high: "#00ff00",
  },
  {
    name: "Cosmic",
    low: "#4b0082",
    high: "#ff69b4",
  },
  {
    name: "Neon Dreams",
    low: "#ff006e",
    high: "#8338ec",
  },
  {
    name: "Astral",
    low: "#7400b8",
    high: "#06ffa5",
  },
  {
    name: "Fractal Mind",
    low: "#d90429",
    high: "#06ffd5",
  },
  // EXTRA TRIPPY PALETTES
  {
    name: "Machine Elves",
    low: "#ff00aa",
    high: "#00ff66",
  },
  {
    name: "Hyperspace",
    low: "#0000ff",
    high: "#ffff00",
  },
  {
    name: "Entity Contact",
    low: "#ff3300",
    high: "#00ffcc",
  },
  {
    name: "Chrysanthemum",
    low: "#ff0066",
    high: "#66ff00",
  },
  {
    name: "Void Walker",
    low: "#220033",
    high: "#ff00ff",
  },
  {
    name: "Neural Storm",
    low: "#003366",
    high: "#ff6600",
  },
  {
    name: "Ego Death",
    low: "#000000",
    high: "#ffffff",
  },
  {
    name: "Breakthrough",
    low: "#6600ff",
    high: "#00ffaa",
  },
];

export const defaultPalette = colorPalettes[3]; // Nebula
export const dmtPalette = colorPalettes[12]; // DMT
