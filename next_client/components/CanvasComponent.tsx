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
  const [drawingData, setDrawingData] = useState<ImageData | null>(null);

  useEffect(() => {
    checkForCanvasContainer();

    if (typeof window === "undefined") return;

    const initialHeight = window.innerHeight;
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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.lineCap = "round";
    context.strokeStyle = "red";
    context.fillStyle = "red";
    context.lineWidth = 4;
    // context.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = context;
  }, [canvasHeight]);

  const handleMovement = (e: React.MouseEvent) => {
    if (!isMouseDown) {
      return;
    }
    console.log(e.clientX, e.clientY);
  };

  const beginDraw = useCallback(
    (x: number, y: number, isRemote: boolean = false) => {
      setIsMouseDown(true);
      if (isMoving) {
        return;
      }
      if (!isRemote) {
        setIsPressed(true);
      }

      if (!contextRef.current || !socket) {
        return;
      }

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

  const handleResize = useCallback(() => {
    console.log("Resizing now");
    const canvas = canvasRef.current;
    const context = contextRef.current;

    if (!canvas || !context) return;

    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");

    if (!tempContext) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempContext.drawImage(canvas, 0, 0);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.strokeStyle = drawingStyle.strokeStyle;
    context.fillStyle = drawingStyle.fillStyle;
    context.lineWidth = drawingStyle.lineWidth;
    context.lineCap = drawingStyle.lineCap;

    console.log(context.strokeStyle, context.fillStyle);

    context.drawImage(tempCanvas, 0, 0);
  }, [drawingData]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const endDraw = () => {
    contextRef.current?.closePath();
    setIsPressed(false);
    setIsMouseDown(false);
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
          style={{ border: "1px solid white" }}
          className="w-full"
        />
      </div>
    </div>
  );
}
