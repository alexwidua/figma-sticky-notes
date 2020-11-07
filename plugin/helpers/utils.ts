import chroma from 'chroma-js';

// Converts Hex to GL, which is a variant of RGBA
export function hexToGl(hex: string): RGB {
  return {
    r: chroma(hex).gl()[0],
    g: chroma(hex).gl()[1],
    b: chroma(hex).gl()[2]
  };
}
