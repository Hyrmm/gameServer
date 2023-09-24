import * as pb from "../Proto/pb"
import { v1 } from "uuid"
import { WebSocketServer, WebSocket } from "ws"
import { protoId2Name } from "../Proto/protoMap"

class webSocketClient extends WebSocket {
    public uuid: string
    public heartbeatTimer: number
    public heartbeatInterval: NodeJS.Timeout
}




export class NetManager {
    static webSocket: WebSocketServer
    static clientList: Map<string, webSocketClient> = new Map()
    static heartbeatTimer: number = 5000


    static init() {
        this.webSocket = new WebSocketServer({ port: 8888, maxPayload: 1024 })
        this.webSocket.on("connection", (ws: webSocketClient) => {
            ws.uuid = v1()
            ws.on("close", this.onClose)
            ws.on("message", this.onMessage)
            ws.heartbeatTimer = this.heartbeatTimer
            ws.heartbeatInterval = setInterval(this.heartBeat.bind(this), ws.heartbeatTimer, ws)
            this.clientList.set(ws.uuid, ws)

        })


    }
    static onClose(this: webSocketClient) {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
        }
        console.log(`[clientClose]:${this.uuid}`)
    }
    static onMessage(this: webSocketClient, data: Buffer) {
        const commonData = pb.decodeCommonData(data)
        const protoName = protoId2Name[commonData.protoId]
        const dataBody = pb[`decode${protoName}`](commonData.body)
        console.log(`[recvData]:${commonData.protoId}|${protoName}`, dataBody, this.uuid)
    }

    static heartBeat(ws: webSocketClient) {
        this.sendData(ws, 1000, { serverTime: Date.now() } as pb.S2C_HeartBeat)
    }

    static broadcastMessage(protoId: number, data: any) {
        for (const [clientUuid, client] of this.clientList) {
            if (client.readyState == WebSocket.OPEN) continue
            this.sendData(client, protoId, data)
        }
    }


    static sendData(ws: webSocketClient, protoId: number, data: any) {
        const protoName = protoId2Name[protoId]
        const dataBody = pb[`encode${protoName}`](data)
        const commonData = { protoId: protoId, body: dataBody }
        ws.send(pb.encodeCommonData(commonData))
        console.log(`[sendData]:${protoId}|${protoName}`, data, ws.uuid)
    }

}


