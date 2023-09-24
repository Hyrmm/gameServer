"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetManager = void 0;
const ws_1 = require("ws");
class NetManager {
    static init() {
        this.webSocket = new ws_1.WebSocketServer({ host: "127.0.0.1", port: 8888 });
    }
}
exports.NetManager = NetManager;
//# sourceMappingURL=NetManager.js.map