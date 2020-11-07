import chroma from 'chroma-js';

// Converts Hexcode to GL, which is a variant of RGBA
export function hexToGl(hex: string): RGB {
  return {
    r: chroma(hex).gl()[0],
    g: chroma(hex).gl()[1],
    b: chroma(hex).gl()[2]
  };
}

// Return random value
export function randomCoord(spread: number): number {
  return Math.floor(Math.random() * spread);
}
