import React, { useEffect, useRef, useState } from "react";

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
  const [canvasState, setCanvasState] = useState({
    drawings: [] as ({ x: number; y: number } | undefined)[][],
    offset: { x: 0, y: 0 },
    scale: 1,
  });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

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

    console.log(canvasState.scale);

    canvasState.drawings.forEach((drawing) => {
      if (!drawing[0]) return;
      context.beginPath();
      context.moveTo(drawing[0].x, drawing[0].y);
      drawing.forEach((point) => {
        if (!point) return;
        context.lineTo(point.x, point.y);
      });
      context.lineCap = "round";
      context.strokeStyle = "red";
      context.fillStyle = "red";
      context.lineWidth = 4 * (1 / canvasState.scale);
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
    if (e.button === 0) {
      console.log("Now drawing");
      setIsDrawing(true);
      setCanvasState((prev) => ({
        ...prev,
        drawings: [...prev.drawings, [coords]],
      }));
    }
    if (e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setLastPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing) {
      const coords = getCoordinates(e);
      setCanvasState((prev) => {
        const updatedDrawings = [...prev.drawings];
        const lastDrawing = updatedDrawings[updatedDrawings.length - 1];
        lastDrawing.push(coords);
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
    setIsDrawing(false);
    setIsPanning(false);
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

  return (
    <div className="w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="cursor-crosshair border border-white"
      />
    </div>
  );
}
