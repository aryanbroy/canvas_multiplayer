// export type CanvasState = {
//   drawings: ({ x: number; y: number; isEraser?: boolean } | undefined)[][];
//   offset: { x: number; y: number };
//   scale: number;
// };

export type Point = {
  x: number;
  y: number;
};

type Offset = {
  x: number;
  y: number;
};

type Drawing = {
  type: string;
  isEraser: boolean;
  points: Point[];
};

export type CanvasState = {
  drawings: Drawing[];
  offset: Offset;
  scale: number;
};

export type TempCanvasState = {
  drawings: ({ x: number; y: number } | undefined)[][];
  opacity: number;
};

export type SquareCanvasState = {
  drawings: { x: number; y: number }[][];
  offset: { x: number; y: number };
};

export type LineCanvasState = {
  drawings: { x: number; y: number }[][];
};

export type ArrowCanvasState = {
  drawings: { x: number; y: number }[][];
};
