import {
  ArrowCanvasState,
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

export const drawArrow = (
  arrowCanvasState: ArrowCanvasState,
  context: CanvasRenderingContext2D
) => {
  arrowCanvasState.drawings.forEach((drawing) => {
    if (!drawing[0]) return;
    // console.log(drawing);
    const fromX = drawing[0].x;
    const fromY = drawing[0].y;

    const arrowHeadLength = 20;

    const toX = drawing[drawing.length - 1].x;
    const toY = drawing[drawing.length - 1].y;

    const angle = Math.atan2(toY - fromY, toX - fromX);

    // draw line
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.strokeStyle = "#e9ecef";
    context.lineWidth = 4;
    context.stroke();

    // draw arrow head
    context.beginPath();
    context.moveTo(toX, toY);
    context.lineTo(
      toX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
      toY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
    );
    context.lineTo(
      toX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
      toY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
    );
    // context.lineTo(toX, toY);
    context.strokeStyle = "#e9ecef";
    context.lineWidth = 4;
    context.fillStyle = "#e9ecef";
    context.fill();

    // lmao this one is interesting
    // if (drawing[drawing.length - 30]) {
    //   context.lineTo(
    //     drawing[drawing.length - 30].x + 10,
    //     drawing[drawing.length - 30].y
    //   );
    // }
    // context.lineCap = "round";
    // context.strokeStyle = "#e9ecef";
    // context.fillStyle = "#e9ecef";
    // context.lineWidth = 4;
    // context.stroke();
  });
};
