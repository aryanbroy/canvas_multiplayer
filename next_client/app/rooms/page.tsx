"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, LogIn } from "lucide-react";
import config from "@/config/shared.config";
import CanvasComponent from "@/components/CanvasComponent";

export default function CreateOrJoinRoom() {
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [clientId, setClientId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newSocket = new WebSocket("ws://localhost:8080");
      setSocket(newSocket);
    }
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
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.type === config.WS_INITIALIZE.CONNECTION) {
        console.log("User joined: " + JSON.stringify(message));
        setClientId(message.clientId);
      }

      if (message.type === config.WS_SEND_NAMES.CREATE_ROOM) {
        console.log("Room create: ", message);
        setRoomId(message.roomId);
        // console.log(message);
      }

      if (message.type === config.WS_SEND_NAMES.JOIN_ROOM) {
        console.log("Joined in the room successfully! ", message);
      }

      // if (message.type === config.WS_DRAW.BEGIN_DRAW) {
      //   if (message.clientId !== clientId) {
      //     beginDraw(message.mouseEvent.x, message.mouseEvent.y, true);
      //   }
      // }

      // if (message.type === config.WS_DRAW.UPDATE_DRAW) {
      //   if (message.clientId !== clientId) {
      //     updateDraw(message.mouseEvent.x, message.mouseEvent.y, true);
      //   }
      // }

      // if (message.type === config.WS_DRAW.CLEAR) {
      //   if (message.clientId !== clientId) {
      //     if (!contextRef.current || !socket) {
      //       return;
      //     }
      //     contextRef.current.clearRect(0, 0, 800, 800);
      //   }
      // }
    };
    console.log("exiting this on message thingy");
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

  const handleCreateRoom = () => {
    if (!socket) {
      return;
    }

    const payload = {
      type: config.WS_SEND_NAMES.CREATE_ROOM,
      clientId: clientId,
    };

    socket.send(JSON.stringify(payload));
  };

  // const handleJoinRoom = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Joining room with code:", roomCode);
  //   setHasJoinedRoom(true);
  // };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) {
      return;
    }

    // const canvasContainer = document.getElementById("canvasContainer");

    // if (!canvasContainer) {
    //   console.log("Canvas container not found!");
    //   return;
    // }

    // canvasContainer.style.display = "block";

    const payload = {
      type: config.WS_SEND_NAMES.JOIN_ROOM,
      clientId,
      roomId,
    };

    socket.send(JSON.stringify(payload));
    setHasJoinedRoom(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* <div
        className="canvas-container"
        style={{ display: "none" }}
        id="canvasContainer"
      > */}
      {!hasJoinedRoom ? (
        <div className="w-full max-w-md p-8 rounded-lg shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            Create or Join a Room
          </h2>
          <p className="text-center mb-8 text-gray-600 dark:text-gray-300">
            Start collaborating on a shared canvas
          </p>

          <div className="space-y-6">
            <Button
              // className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              className="w-full text-lg py-6 bg-gray-900 text-white hover:bg-gray-700"
              onClick={handleCreateRoom}
            >
              <PlusCircle className="mr-2 h-5 w-5 text-white" />
              Create a New Room
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="roomId"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Room Code
                </Label>
                <Input
                  id="roomId"
                  placeholder="Enter room code"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-700"
                />
              </div>
              <Button
                type="submit"
                //   className="w-full text-lg py-6 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                className="w-full text-lg py-6 bg-gray-900 text-white hover:bg-gray-700"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Join Existing Room
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <CanvasComponent socket={socket} clientId={clientId} roomId={roomId} />
        // <div className="App" onMouseUp={endDraw}>
        //   <div>
        //     <h1>Kingdom come</h1>
        //     <p>Client id: {clientId}</p>
        //     <div
        //       className=""
        //       style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem" }}
        //     >
        //       <button onClick={handleCreateRoom}>Create room</button>
        //       <button onClick={handleJoinRoom}>Join room</button>
        //       <input
        //         type="text"
        //         id="roomId"
        //         value={roomId}
        //         onChange={(e) => setRoomId(e.target.value)}
        //       />
        //     </div>
        //   </div>
        //   <div
        //     className="canvas-container"
        //     style={{ display: "none" }}
        //     id="canvasContainer"
        //   >
        //     <button onClick={clearCanvas} style={{ display: "block" }}>
        //       Clear
        //     </button>
        //     <canvas
        //       ref={canvasRef}
        //       onMouseDown={(e) =>
        //         beginDraw(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        //       }
        //       onMouseMove={(e) =>
        //         updateDraw(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        //       }
        //       onMouseUp={endDraw}
        //       style={{ border: "1px solid red" }}
        //     />
        //   </div>
        // </div>
      )}
    </div>
  );
}
