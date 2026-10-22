import mnistJson from "./mnistData.json";

export type MNISTDigitKey = "7" | "2" | "1" | "0" | "4";

export const MNIST_SAMPLES: Record<string, number[][]> = mnistJson as Record<string, number[][]>;

export const DEFAULT_DIGIT: MNISTDigitKey = "7";

export const AVAILABLE_DIGITS: MNISTDigitKey[] = ["7", "2", "1", "0", "4"];

export interface FilterDefinition {
  id: string;
  name: string;
  category: "edge" | "blur" | "detail" | "basic";
  description: string;
  kernel: number[][];
  divisor?: number;
  bias?: number;
}

export const CLASSICAL_FILTERS: FilterDefinition[] = [
  {
    id: "sobel-h",
    name: "Horizontal Edge (Sobel)",
    category: "edge",
    description: "Detects horizontal borders and strokes (like the top bar of digit 7) by computing vertical differences.",
    kernel: [
      [-1, -2, -1],
      [ 0,  0,  0],
      [ 1,  2,  1],
    ],
  },
  {
    id: "sobel-v",
    name: "Vertical Edge (Sobel)",
    category: "edge",
    description: "Detects vertical borders and strokes (like the stem of digit 7) by computing horizontal differences.",
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
  },
  {
    id: "ridge",
    name: "Ridge / Outline (Laplacian)",
    category: "edge",
    description: "Calculates the second-order derivative in all directions to extract an outline silhouette of the digit.",
    kernel: [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1],
    ],
  },
  {
    id: "gaussian-blur",
    name: "Gaussian Blur",
    category: "blur",
    description: "Averages each pixel with its neighbors according to a 2D Gaussian bell curve, smoothing noise.",
    kernel: [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1],
    ],
    divisor: 16,
  },
  {
    id: "box-blur",
    name: "Box Blur",
    category: "blur",
    description: "Assigns equal weight to every pixel in the 3x3 window, averaging out sharp variations.",
    kernel: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    divisor: 9,
  },
  {
    id: "sharpen",
    name: "Sharpen",
    category: "detail",
    description: "Boosts the difference between a pixel and its neighbors, emphasizing crisp boundaries.",
    kernel: [
      [ 0, -1,  0],
      [-1,  5, -1],
      [ 0, -1,  0],
    ],
  },
  {
    id: "identity",
    name: "Identity",
    category: "basic",
    description: "Leaves the image unchanged by passing the center pixel directly through to the output.",
    kernel: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
  },
];
