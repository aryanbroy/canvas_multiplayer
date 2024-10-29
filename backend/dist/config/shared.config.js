"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sharedConfig = {
    WS_INITIALIZE: {
        CONNECTION: "connection",
    },
    WS_SEND_NAMES: {
        CREATE_ROOM: "create_room",
        JOIN_ROOM: "join_room",
    },
    WS_DRAW: {
        BEGIN_DRAW: "begin_draw",
        UPDATE_DRAW: "update_draw",
        END_DRAW: "end_draw",
    },
};
exports.default = sharedConfig;
