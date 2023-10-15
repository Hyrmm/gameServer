import * as pb from "../Proto/pb"
import { v1 } from "uuid"
import { WebSocketServer, WebSocket } from "ws"
import { protoId2Name } from "../Proto/protoMap"

class webSocketClient extends WebSocket {
    public uuid: string
    public heartbeatTimer: number
    public heartbeatInterval: NodeJS.Timeout
    public lastHearbeatTime: string
}




export class NetManager {
    static webSocket: WebSocketServer
    static clientList: Map<string, webSocketClient> = new Map()
    static heartbeatTimer: number = 5000
    static heartbeatTimeoutTimer: number = 30 * 1000


    static init() {
        this.webSocket = new WebSocketServer({ port: 8888, maxPayload: 1024 })
        this.webSocket.on("connection", (ws: webSocketClient) => {
            ws.uuid = v1()

            ws.on("close", this.onClose)
            ws.on("message", this.recvData)

            ws.lastHearbeatTime = String(Date.now())

            ws.heartbeatInterval = setInterval(this.sendHeartbeat.bind(this), NetManager.heartbeatTimer, ws)
            this.clientList.set(ws.uuid, ws)
        })


    }

    static onClose(this: webSocketClient) {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            NetManager.clientList.delete(this.uuid)
        }
        console.log(`[clientClose]:${this.uuid}`)
    }



    static sendHeartbeat(ws: webSocketClient) {
        const serverTime = Date.now()

        if (ws.lastHearbeatTime && (serverTime - Number(ws.lastHearbeatTime)) >= NetManager.heartbeatTimeoutTimer) {
            clearInterval(ws.heartbeatInterval)
            return ws.close()
        }
        this.sendData(ws, 1000, { serverTime: String(Date.now()) } as pb.S2C_HeartBeat)
    }

    static recvHeartbeat(ws: webSocketClient) {
        ws.lastHearbeatTime = String(Date.now())
    }

    static broadcastMessage(protoId: number, data: any) {
        for (const [clientUuid, client] of this.clientList) {
            if (client.readyState == WebSocket.OPEN) continue
            this.sendData(client, protoId, data)
        }
    }


    static recvData(this: webSocketClient, data: Buffer) {
        const commonData = pb.decodeCommonData(data)
        const protoName = protoId2Name[commonData.protoId]
        const dataBody = pb[`decode${protoName}`](commonData.body)
        if (commonData.protoId == 1001) {
            NetManager.recvHeartbeat(this)
        }
        console.log(`[recvData]:${commonData.protoId}|${protoName}`, dataBody, this.uuid)
    }

    static sendData(ws: webSocketClient, protoId: number, data: any) {
        const protoName = protoId2Name[protoId]
        const dataBody = pb[`encode${protoName}`](data)
        const commonData = { protoId: protoId, body: dataBody }
        ws.send(pb.encodeCommonData(commonData), { binary: true })
        console.log(`[sendData]:${protoId}|${protoName}`, data, ws.uuid)
    }

}


