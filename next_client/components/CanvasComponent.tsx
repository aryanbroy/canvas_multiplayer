"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import config from "@/config/shared.config";
import { Button } from "./ui/button";


const checkForCanvasContainer = () => {
  const canvasContainer = document.getElementById("canvasContainer");

  if (!canvasContainer) {
    console.log("Canvas container not found!");
    return;
  }

  canvasContainer.style.display = "block";
};

const drawingStyle = {
  lineCap: "round" as CanvasLineCap,
  strokeStyle: "red",
  fillStyle: "red",
  lineWidth: 4,
};

// const mouseDragMovementEnd = {
//   x: 0,
//   y: 0,
// };

type MaxCanvasSize = {
  height: number;
  width: number;
};

export default function CanvasComponent({
  socket,
  clientId,
  roomId,
}: {
  socket: WebSocket | null;
  clientId: string;
  roomId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [zoom, setZoom] = useState(1);
  const originalCanvasRef = useRef<{
    imageData?: ImageData;
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  // const [mouseDragStartCoordinates, setMouseDragStartCoordinates] = useState({
  //   x: 0,
  //   y: 0,
  // });

  const [canvasNewPos, setCanvasNewPos] = useState({ x: 0, y: 0 });
  const mouseDragMovementEnd = useRef({ x: 0, y: 0 });
  const mouseDragStartCoordinates = useRef({ x: 0, y: 0 });
  const [previousMouseDirection, setPreviousMouseDirection] = useState<
    number | null
  >(null);

  useEffect(() => {
    checkForCanvasContainer();

    if (typeof window === "undefined") return;
    console.log("initialized canvas");

    const initialHeight = window.innerHeight;
    const initialWidth = window.innerWidth;
    setCanvasHeight(initialHeight);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!socket) {
      console.log("Socket not initialized!");
      return;
    }

    console.log("Socket initialized:", socket);
  }, [socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      console.log("no context for canvas");
      return;
    }

    canvas.width = 2000;
    canvas.height = 2000;

    context.lineCap = "round";
    context.strokeStyle = "red";
    context.fillStyle = "red";
    context.lineWidth = 4;
    // context.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = context;
  }, [canvasHeight]);

  const handleMovement = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;

    if (!isMouseDown || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mousePositionX = e.clientX - rect.x;
    const mousePositionY = e.clientY - rect.y;

    if (previousMouseDirection !== null) {
      if (mousePositionX < previousMouseDirection) {
        console.log("moving left");
        setCanvasNewPos({ x: -1, y: 0 });
      } else if (mousePositionX > previousMouseDirection) {
        console.log("moving right");
        setCanvasNewPos({ x: 1, y: 0 });
      }
    }

    setPreviousMouseDirection(mousePositionX);
  };
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    console.log(canvasNewPos.x, canvasNewPos.y);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(imageData, canvasNewPos.x > 0 ? 20 : -20, 0);
  }, [canvasNewPos]);

  const beginDraw = useCallback(
    (x: number, y: number, isRemote: boolean = false) => {
      setIsMouseDown(true);
      mouseDragStartCoordinates.current = { x, y };
      if (isMoving) {
        return;
      }
      if (!isRemote) {
        setIsPressed(true);
      }

      if (!contextRef.current || !socket) {
        return;
      }
      // contextRef.current.translate(10, 10);
      // contextRef.current.fillRect(10, 10, 100, 50);

      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);

      if (!isRemote) {
        const payload = {
          type: config.WS_DRAW.BEGIN_DRAW,
          mouseEvent: {
            x: x,
            y: y,
          },
          clientId,
          roomId,
        };

        socket.send(JSON.stringify(payload));
      }
    },
    [clientId, roomId, socket]
  );

  const updateDraw = useCallback(
    (x: number, y: number, isRemote: boolean = false) => {
      if (isMoving) {
        return;
      }
      if (!isPressed && !isRemote) {
        return;
      }

      const canvas = canvasRef.current;

      if (!canvas) return;

      if (!contextRef.current) {
        return;
      }
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();

      if (!isRemote) {
        const payload = {
          type: config.WS_DRAW.UPDATE_DRAW,
          mouseEvent: {
            x: x,
            y: y,
          },
          clientId,
          roomId,
        };
        socket?.send(JSON.stringify(payload));
      }
    },
    [clientId, roomId, isPressed, socket]
  );

  const clearCanvas = () => {
    if (!contextRef.current || !socket || !canvasRef || !canvasRef.current) {
      return;
    }

    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current?.width,
      canvasRef.current?.height
    );

    const payload = {
      type: config.WS_DRAW.CLEAR,
      clientId,
      roomId,
    };
    socket.send(JSON.stringify(payload));
  };

  useEffect(() => {
    if (!socket) {
      console.log("No socket present :)");
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);

      if (message.type === config.WS_DRAW.BEGIN_DRAW) {
        if (message.clientId !== clientId || !socket) {
          beginDraw(message.mouseEvent.x, message.mouseEvent.y, true);
        }
      }

      if (message.type === config.WS_DRAW.UPDATE_DRAW) {
        if (message.clientId !== clientId) {
          updateDraw(message.mouseEvent.x, message.mouseEvent.y, true);
        }
      }

      if (message.type === config.WS_DRAW.CLEAR) {
        if (message.clientId !== clientId) {
          if (!contextRef.current || !socket) {
            return;
          }
          contextRef.current.clearRect(0, 0, 800, 800);
        }
      }
    };
  }, [socket, beginDraw, updateDraw, clientId]);

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const canvas = canvasRef.current;

      if (!canvas) return;

      const context = canvas.getContext("2d");

      if (!context) return;

      const delta = e.deltaY;
      const zoomFactor = delta > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoomFactor * zoom, 0.1), 10);

      // get original width height and canvas image data from original canvas
      const { imageData, width, height } = originalCanvasRef.current;

      if (imageData) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempContext = tempCanvas.getContext("2d");

        if (!tempContext) return;

        tempContext.imageSmoothingEnabled = true;
        tempContext.imageSmoothingQuality = "high";

        tempContext.putImageData(imageData, 0, 0);

        context.clearRect(0, 0, canvas.width, canvas.height);

        // save current context to be restored later
        // imp! as without this everything we draw after it will follow the same scale as of now
        context.save();

        context.scale(newZoom, newZoom);

        context.drawImage(
          tempCanvas,
          (width * (1 - newZoom)) / (2 * newZoom), // ai did this, i am not qualified enough for this shii
          (height * (1 - newZoom)) / (2 * newZoom) // basically centers the image when we zoom out and in
        );

        // restores the scale so that we can return to the original scale
        context.restore();

        setZoom(newZoom);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    // window.addEventListener("resize", handleResize);

    return () => {
      // window.removeEventListener("resize", handleResize);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  const endDraw = () => {
    contextRef.current?.closePath();
    setIsPressed(false);
    setIsMouseDown(false);

    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    if (!canvas || !ctx) {
      return;
    }

    originalCanvasRef.current = {
      imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
      width: canvas.width,
      height: canvas.height,
    };
  };

  return (
    <div className="App w-full" onMouseUp={endDraw}>
      <div
        className="canvas-container w-full"
        style={{ display: "none" }}
        id="canvasContainer"
      >
        <div className="flex gap-4 my-4">
          <Button onClick={clearCanvas} style={{ display: "block" }}>
            Clear
          </Button>
          <Button onClick={() => setIsMoving(true)}>Move</Button>
          <Button onClick={() => setIsMoving(false)}>Draw</Button>
        </div>
        <canvas
          ref={canvasRef}
          onMouseDown={(e) =>
            beginDraw(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
          }
          onMouseMove={
            isMoving && isMouseDown
              ? handleMovement
              : (e) => updateDraw(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
          }
          onMouseUp={endDraw}
          style={{
            // position: "absolute",
            // top: `${canvasNewPos.y}px`,
            // left: `${canvasNewPos.x}px`,
            border: "1px solid white",
            cursor:
              isMoving && isMouseDown
                ? "grabbing"
                : isMouseDown
                ? "crosshair"
                : isMoving
                ? "grab"
                : "default",
          }}
        />
      </div>
    </div>
  );
}
