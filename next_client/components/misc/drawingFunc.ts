import {
  CanvasState,
  LineCanvasState,
  SquareCanvasState,
  TempCanvasState,
} from "@/lib/types";

export const drawCanvasState = (
  canvasState: CanvasState,
  context: CanvasRenderingContext2D
) => {
  canvasState.drawings.forEach((drawing) => {
    if (!drawing[0]) return;
    context.beginPath();
    context.moveTo(drawing[0].x, drawing[0].y);
    drawing.forEach((point) => {
      if (!point) return;
      context.lineTo(point.x, point.y);
    });
    context.lineCap = "round";
    context.strokeStyle = drawing[0]?.isEraser ? "#121212" : "#e9ecef";
    context.fillStyle = drawing[0].isEraser ? "#121212" : "#e9ecef";
    context.lineWidth = drawing[0].isEraser ? 15 : 4 * (1 / canvasState.scale);
    context.stroke();
  });
};

export const drawTempCanvasState = (
  tempCanvasState: TempCanvasState,
  context: CanvasRenderingContext2D
) => {
  tempCanvasState.drawings.forEach((drawing) => {
    if (!drawing[0]) return;
    context.beginPath();
    context.moveTo(drawing[0].x, drawing[0].y);
    drawing.forEach((point) => {
      if (!point) return;
      context.lineTo(point.x, point.y);
    });
    context.lineCap = "round";
    context.shadowBlur = 10;
    context.shadowColor = "red";
    context.strokeStyle = "#ff073a";
    context.fillStyle = "#ff073a";
    context.lineWidth = 8;
    context.stroke();
  });
};

export const drawSquare = (
  squareCanvasState: SquareCanvasState,
  context: CanvasRenderingContext2D
) => {
  squareCanvasState.drawings.forEach((drawing) => {
    if (!drawing[0]) return;
    context.beginPath();
    context.rect(
      drawing[0].x,
      drawing[0].y,
      drawing[drawing.length - 1].x - drawing[0].x,
      drawing[drawing.length - 1].y - drawing[0].y
    );
    context.lineCap = "round";
    context.strokeStyle = "#e9ecef";
    context.fillStyle = "#e9ecef";
    context.lineWidth = 4;
    context.stroke();
  });
};

export const drawLine = (
  lineCanvasState: LineCanvasState,
  context: CanvasRenderingContext2D
) => {
  lineCanvasState.drawings.forEach((drawing) => {
    if (!drawing[0]) return;
    context.beginPath();
    context.moveTo(drawing[0].x, drawing[0].y);
    context.lineTo(
      drawing[drawing.length - 1].x,
      drawing[drawing.length - 1].y
    );
    context.lineCap = "round";
    context.strokeStyle = "#e9ecef";
    context.fillStyle = "#e9ecef";
    context.lineWidth = 4;
    context.stroke();
  });
};
