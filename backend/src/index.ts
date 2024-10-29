import WebSocket, { WebSocketServer } from "ws";
import config from "./config/shared.config";

const wss = new WebSocketServer({ port: 8080 });

const clients: { [key: string]: { connection: WebSocket } } = {};
const rooms: { [key: string]: { roomId: string; clients: string[] } } = {};

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    const message = JSON.parse(data.toString());

    if (message.type === config.WS_SEND_NAMES.CREATE_ROOM) {
      const clientId = message.clientId;
      const roomId = guid();

      rooms[roomId] = {
        roomId: roomId,
        clients: [],
      };

      const payload = {
        type: config.WS_SEND_NAMES.CREATE_ROOM,
        roomId,
      };

      const con = clients[clientId].connection;
      con.send(JSON.stringify(payload));
    }

    //join room
    if (message.type === config.WS_SEND_NAMES.JOIN_ROOM) {
      const clientId = message.clientId;
      const roomId = message.roomId;
      const room = rooms[roomId];

      room.clients.push(clientId);

      const payload = {
        type: config.WS_SEND_NAMES.JOIN_ROOM,
        msg: "Joined room",
        clients: rooms[roomId].clients,
        room,
      };

      const roomClients = rooms[roomId].clients;

      roomClients.map((client) => {
        const con = clients[client].connection;
        con.send(JSON.stringify(payload));
      });
    }

    // begin draw
    if (message.type === config.WS_DRAW.BEGIN_DRAW) {
      const clientId = message.clientId;
      const roomId = message.roomId;
      const room = rooms[roomId];
      const mouseEvent = message.mouseEvent;

      const payload = {
        type: config.WS_DRAW.BEGIN_DRAW,
        mouseEvent,
        clientId,
        room,
      };

      const roomClients = rooms[roomId].clients;

      for (const inRoomClientId of room.clients) {
        if (inRoomClientId !== clientId) {
          const con = clients[inRoomClientId].connection;
          con.send(JSON.stringify(payload));
        }
      }
    }

    // update draw
    if (message.type === config.WS_DRAW.UPDATE_DRAW) {
      const clientId = message.clientId;
      const roomId = message.roomId;
      const room = rooms[roomId];
      const mouseEvent = message.mouseEvent;

      const payload = {
        type: config.WS_DRAW.UPDATE_DRAW,
        mouseEvent,
        clientId,
        room,
      };

      for (const inRoomClientId of room.clients) {
        if (inRoomClientId !== clientId) {
          const con = clients[inRoomClientId].connection;
          con.send(JSON.stringify(payload));
        }
      }
    }
  });

  const clientId = guid();
  clients[clientId] = {
    connection: ws,
  };

  const payload = {
    type: "connection",
    clientId,
  };

  ws.send(JSON.stringify(payload));
});

const guid = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
};
