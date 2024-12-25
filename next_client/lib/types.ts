export type CanvasState = {
  drawings: ({ x: number; y: number; isEraser?: boolean } | undefined)[][];
  offset: { x: number; y: number };
  scale: number;
};

export type TempCanvasState = {
  drawings: ({ x: number; y: number } | undefined)[][];
  opacity: number;
};

export type SquareCanvasState = {
  drawings: { x: number; y: number }[][];
};

export type LineCanvasState = {
  drawings: { x: number; y: number }[][];
};
