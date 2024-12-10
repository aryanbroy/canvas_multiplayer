"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import config from "@/config/shared.config";
import { runTurboTracing } from "next/dist/build/swc/generated-native";

const checkForCanvasContainer = () => {
  const canvasContainer = document.getElementById("canvasContainer");

  if (!canvasContainer) {
    console.log("Canvas container not found!");
    return;
  }

  canvasContainer.style.display = "block";
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
  //   const [socket, setSocket] = useState<WebSocket | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  //   const [clientId, setClientId] = useState("");
  //   const [roomId, setRoomId] = useState("");
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    checkForCanvasContainer();
  }, []);

  //   useEffect(() => {
  //     if (typeof window !== "undefined") {
  //       const newSocket = new WebSocket("ws://localhost:8080");
  //       setSocket(newSocket);
  //     }
  //   }, []);

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

  const beginDraw = useCallback(
    (x: number, y: number, isRemote: boolean = false) => {
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
    if (!contextRef.current || !socket) {
      return;
    }
    contextRef.current.clearRect(0, 0, 800, 800);

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
      //   if (message.type === config.WS_INITIALIZE.CONNECTION) {
      //     console.log("User joined: " + JSON.stringify(message));
      //     setClientId(message.clientId);
      //   }

      //   if (message.type === config.WS_SEND_NAMES.CREATE_ROOM) {
      //     console.log("Room create: ", message);
      //     setRoomId(message.roomId);
      //     // console.log(message);
      //   }

      //   if (message.type === config.WS_SEND_NAMES.JOIN_ROOM) {
      //     console.log("Joined in the room successfully! ", message);
      //   }

      if (message.type === config.WS_DRAW.BEGIN_DRAW) {
        if (message.clientId !== clientId) {
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

  const endDraw = () => {
    contextRef.current?.closePath();
    setIsPressed(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    canvas.width = 800;
    canvas.height = 800;

    const context = canvas.getContext("2d");

    if (!context) {
      console.log("no context for canvas");
      return;
    }
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 4;

    contextRef.current = context;

    // if (!socket) {
    //   return;
    // }

    // socket.onmessage = (event) => {
    //   const message = JSON.parse(event.data);
    //   if (message.type === config.WS_INITIALIZE.CONNECTION) {
    //     console.log(message);
    //     setClientId(message.clientId);
    //   }
    // };
  }, []);

  //   const handleJoinRoom = () => {
  //     if (!socket) {
  //       return;
  //     }

  //     const canvasContainer = document.getElementById("canvasContainer");

  //     if (!canvasContainer) {
  //       console.log("Canvas container not found!");
  //       return;
  //     }

  //     canvasContainer.style.display = "block";

  //     const payload = {
  //       type: config.WS_SEND_NAMES.JOIN_ROOM,
  //       clientId,
  //       roomId,
  //     };

  //     socket.send(JSON.stringify(payload));
  //   };
  return (
    <div className="App" onMouseUp={endDraw}>
      <div
        className="canvas-container"
        style={{ display: "none" }}
        id="canvasContainer"
      >
        <button onClick={clearCanvas} style={{ display: "block" }}>
          Clear
        </button>
        <canvas
          ref={canvasRef}
          onMouseDown={(e) =>
            beginDraw(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
          }
          onMouseMove={(e) =>
            updateDraw(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
          }
          onMouseUp={endDraw}
          style={{ border: "1px solid red" }}
        />
      </div>
    </div>
  );
}
