import { CanvasState, SquareCanvasState, TempCanvasState } from "@/lib/types";
import {
  ALargeSmall,
  Eraser,
  Minus,
  MoveRight,
  PencilLine,
  PencilOff,
  Square,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  drawCanvasState,
  drawSquare,
  drawTempCanvasState,
} from "../misc/drawingFunc";
import { Button } from "../ui/button";

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
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    drawings: [],
    offset: { x: 0, y: 0 },
    scale: 1,
  });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [activeBtn, setActiveBtn] = useState("draw");
  const [isTempDrawing, setIsTempDrawing] = useState(false);
  const [tempCanvasState, setTempCanvasState] = useState<TempCanvasState>({
    drawings: [],
    opacity: 1,
  });
  const [isDrawingSquare, setIsDrawingSquare] = useState(false);
  const [squareCanvasState, setSquareCanvasState] = useState<SquareCanvasState>(
    {
      drawings: [],
      offset: { x: 0, y: 0 },
    }
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (activeBtn === "draw" || activeBtn === "square") {
      canvas.style.cursor = "crosshair";
    }
    if (activeBtn === "erase") {
      canvas.style.cursor = "url('/erase.svg') 15 15, auto";
    }
  }, [activeBtn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();

    context.translate(canvasState.offset.x, canvasState.offset.y);
    context.scale(canvasState.scale, canvasState.scale);

    // draw the permanent drawings
    drawCanvasState(canvasState, context);

    context.restore();

    context.save();

    //draw the temporary drawings
    context.globalAlpha = tempCanvasState.opacity;
    drawTempCanvasState(tempCanvasState, context);
    context.restore();

    // context.save();
    // drawSquare(squareCanvasState, context);
    // context.restore();

    // context.save();
    // drawLine(lineCanvasState, context);
    // context.restore();
  }, [canvasState, tempCanvasState, squareCanvasState]);

  const getCoordinates = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x =
      (e.clientX - rect.left - canvasState.offset.x) / canvasState.scale;
    const y = (e.clientY - rect.top - canvasState.offset.y) / canvasState.scale;

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    if (e.button === 0) {
      // if (activeBtn === "line") {
      //   setIsDrawingLine(true);
      //   setLineCanvasState((prev) => ({
      //     drawings: [...prev.drawings, [{ ...coords }]],
      //   }));
      // }

      // if (activeBtn === "square") {
      //   setIsDrawingSquare(true);
      //   setSquareCanvasState((prev) => ({
      //     ...prev,
      //     drawings: [...prev.drawings, [{ ...coords }]],
      //   }));
      // }
      if (activeBtn === "disPencil") {
        setIsTempDrawing(true);
        setTempCanvasState((prev) => ({
          ...prev,
          drawings: [
            ...prev.drawings,
            [
              {
                ...coords,
              },
            ],
          ],
          opacity: 1,
        }));
        return;
      }
      if (
        activeBtn === "draw" ||
        activeBtn === "erase" ||
        activeBtn === "arrow" ||
        activeBtn === "line" ||
        activeBtn === "square"
      ) {
        // console.log("drawing", activeBtn);
        setIsDrawing(true);

        setCanvasState((prev) => ({
          ...prev,
          drawings: [
            ...prev.drawings,
            {
              points: [coords],
              isEraser: activeBtn === "erase",
              type: activeBtn,
            },
          ],
        }));
      }
    }
    if (e.button === 1 || e.button === 2) {
      setIsPanning(true);
      canvas.style.cursor = "grabbing";
      setLastPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    if (isTempDrawing) {
      setTempCanvasState((prev) => {
        const updatedDrawings = [...prev.drawings];
        const lastDrawing = updatedDrawings[updatedDrawings.length - 1];
        lastDrawing?.push({ ...coords });
        return { ...prev, drawings: updatedDrawings, opacity: 1 };
      });
    }
    if (isDrawing) {
      setCanvasState((prev) => {
        const updatedDrawings = [...prev.drawings];
        const lastDrawing = updatedDrawings[updatedDrawings.length - 1];
        if (lastDrawing.type === "arrow") {
          lastDrawing.points = [lastDrawing.points[0], coords];
        } else if (lastDrawing.type === "draw") {
          lastDrawing.points.push(coords);
        } else {
          lastDrawing.points.push(coords);
        }
        return { ...prev, drawings: updatedDrawings };
      });
    }
    if (isPanning) {
      const deltaX = e.clientX - lastPosition.x;
      const deltaY = e.clientY - lastPosition.y;
      setCanvasState((prev) => ({
        ...prev,
        offset: {
          x: prev.offset.x + deltaX,
          y: prev.offset.y + deltaY,
        },
      }));

      // setSquareCanvasState((prev) => ({
      //   ...prev,
      //   offset: {
      //     x: prev.offset.x + deltaX,
      //     y: prev.offset.y + deltaY,
      //   },
      // }));

      setLastPosition({ x: e.clientX, y: e.clientY });
    }
    // if (isDrawingSquare) {
    //   setSquareCanvasState((prev) => {
    //     const updatedDrawings = [...prev.drawings];
    //     const lastDrawing = updatedDrawings[updatedDrawings.length - 1];
    //     lastDrawing.push({ ...coords });
    //     return { ...prev, drawings: updatedDrawings };
    //   });
    // }
  };

  const fadeOut = async () => {
    let fadeTime = 50;
    let fadeOutValue = 0.05;

    return new Promise(() => {
      const fadeEffect = setInterval(() => {
        setTempCanvasState((prev) => {
          if (prev.opacity <= 0) {
            clearInterval(fadeEffect);
            return { drawings: [], opacity: 1 };
          }
          return { ...prev, opacity: prev.opacity - fadeOutValue };
        });
      }, fadeTime);
    });
  };

  const handleMouseUp = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    console.log(canvasState);

    setIsDrawing(false);
    setIsPanning(false);
    setIsTempDrawing(false);
    setIsDrawingSquare(false);
    await fadeOut();
  };
  const handleWheel = (e: React.WheelEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (e.deltaY > 0) {
      setCanvasState((prev) => ({
        ...prev,
        scale: prev.scale * 0.9,
      }));
    } else {
      setCanvasState((prev) => ({
        ...prev,
        scale: prev.scale * 1.1,
      }));
    }
  };

  const handleCanvasClear = () => {
    setCanvasState((prev) => ({ ...prev, drawings: [] }));
    setSquareCanvasState((prev) => ({ ...prev, drawings: [] }));
  };

  const handleBtnClick = (e: any) => {
    const target = e.target as HTMLElement;
    setActiveBtn(target.id);
  };

  return (
    <div className="w-full h-screen overflow-hidden relative flex justify-center bg-defaultBg">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="block"
      />
      <div className="absolute flex gap-2 p-1 top-5 bg-slate-800 bg-opacity-50 rounded-lg">
        <Button variant={"ghost"} size={"icon"} onClick={handleCanvasClear}>
          <X size={15} />
        </Button>
        <Button
          id="draw"
          onClick={handleBtnClick}
          variant={activeBtn === "draw" ? "default" : "ghost"}
          size={"icon"}
        >
          <PencilLine />
        </Button>
        <Button
          id="square"
          variant={activeBtn === "square" ? "default" : "ghost"}
          onClick={handleBtnClick}
          size={"icon"}
        >
          <Square />
        </Button>
        <Button
          id="input"
          onClick={handleBtnClick}
          variant={activeBtn === "input" ? "default" : "ghost"}
          size={"icon"}
        >
          <ALargeSmall />
        </Button>
        <Button
          id="erase"
          onClick={handleBtnClick}
          variant={activeBtn === "erase" ? "default" : "ghost"}
          size={"icon"}
        >
          <Eraser />
        </Button>
        <Button
          id="line"
          onClick={handleBtnClick}
          variant={activeBtn === "line" ? "default" : "ghost"}
          size={"icon"}
        >
          <Minus />
        </Button>
        <Button
          id="arrow"
          onClick={handleBtnClick}
          variant={activeBtn === "arrow" ? "default" : "ghost"}
          size={"icon"}
        >
          <MoveRight />
        </Button>
        <Button
          id="disPencil"
          variant={activeBtn === "disPencil" ? "default" : "ghost"}
          size={"icon"}
          onClick={handleBtnClick}
        >
          <PencilOff />
        </Button>
      </div>
    </div>
  );
}
