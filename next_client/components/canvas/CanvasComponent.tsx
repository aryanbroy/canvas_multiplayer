import React, { useEffect, useRef, useState } from "react";
import { X, PencilLine, ALargeSmall, Ghost, Eraser } from "lucide-react";
import { Button } from "../ui/button";

type CanvasState = {
  drawings: ({ x: number; y: number; isEraser?: boolean } | undefined)[][];
  offset: { x: number; y: number };
  scale: number;
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    drawings: [],
    offset: { x: 0, y: 0 },
    scale: 1,
  });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [activeBtn, setActiveBtn] = useState("draw");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // canvas.width = 800;
    // canvas.height = 800;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();

    context.translate(canvasState.offset.x, canvasState.offset.y);
    context.scale(canvasState.scale, canvasState.scale);

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
      context.lineWidth = drawing[0].isEraser
        ? 15
        : 4 * (1 / canvasState.scale);
      context.stroke();
    });

    context.restore();
  }, [canvasState]);

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
      if (activeBtn === "draw" || activeBtn === "erase") {
        console.log("Now drawing");
        setIsDrawing(true);
        setCanvasState((prev) => ({
          ...prev,
          drawings: [
            ...prev.drawings,
            [
              {
                ...coords,
                isEraser: activeBtn === "erase",
              },
            ],
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
    if (isDrawing) {
      const coords = getCoordinates(e);
      if (!coords) return;
      setCanvasState((prev) => {
        const updatedDrawings = [...prev.drawings];
        const lastDrawing = updatedDrawings[updatedDrawings.length - 1];
        lastDrawing.push({ ...coords, isEraser: activeBtn === "erase" });
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
      setLastPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    console.log(canvasState.drawings);
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(false);
    setIsPanning(false);

    canvas.style.cursor = "default";
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
        className="cursor-crosshair block"
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
      </div>
    </div>
  );
}
