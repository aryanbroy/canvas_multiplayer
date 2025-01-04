import {
  CanvasState,
  Point,
  SquareCanvasState,
  TempCanvasState,
} from "@/lib/types";

export const drawCanvasState = (
  canvasState: CanvasState,
  context: CanvasRenderingContext2D
) => {
  canvasState.drawings.forEach((drawing) => {
    if (!drawing.points[0]) return;
    if (drawing.type === "arrow") {
      drawArrow(drawing.points, context);
    } else if (drawing.type === "line") {
      drawLine(drawing.points, context);
    } else if (drawing.type === "draw" || drawing.type === "erase") {
      context.beginPath();
      context.moveTo(drawing.points[0].x, drawing.points[0].y);
      drawing.points.forEach((point) => {
        if (!point) return;
        context.lineTo(point.x, point.y);
      });
      context.lineCap = "round";
      context.strokeStyle = drawing?.isEraser ? "#121212" : "#e9ecef";
      context.fillStyle = drawing.isEraser ? "#121212" : "#e9ecef";
      context.lineWidth = drawing.isEraser ? 15 : 4 * (1 / canvasState.scale);
      context.stroke();
    } else if (drawing.type === "square") {
      drawSquare(drawing.points, context);
    }
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
  drawing: Point[],
  context: CanvasRenderingContext2D
) => {
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
};

export const drawLine = (
  drawing: Point[],
  context: CanvasRenderingContext2D
) => {
  if (!drawing[0]) return;
  context.beginPath();
  context.moveTo(drawing[0].x, drawing[0].y);
  context.lineTo(drawing[drawing.length - 1].x, drawing[drawing.length - 1].y);
  context.lineCap = "round";
  context.strokeStyle = "#e9ecef";
  context.fillStyle = "#e9ecef";
  context.lineWidth = 4;
  context.stroke();
};

export const drawArrow = (
  points: Point[],
  context: CanvasRenderingContext2D
) => {
  const fromX = points[0].x;
  const fromY = points[0].y;

  const toX = points[points.length - 1].x;
  const toY = points[points.length - 1].y;

  const arrowHeadLength = 20;

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
};
