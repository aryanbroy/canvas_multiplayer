import { useEffect, useState } from "react";

const SOCKET_URL = "ws://localhost:8080";
const ws = new WebSocket(SOCKET_URL);

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    setSocket(ws);

    ws.onclose = () => {
      setSocket(null);
    };

    // return () => {
    //   ws.close();
    // };
  }, []);
  return socket;
};
