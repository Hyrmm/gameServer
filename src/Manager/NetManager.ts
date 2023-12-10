import * as pb from "../Proto/proto"
import { v1 } from "uuid"
import { WebSocketServer, WebSocket } from "ws"
import { EnumProtoId, protoId2Name, protoName2Id } from "../Proto/protoMap"
import { BaseManager } from "./BaseManager"
import { EventManager } from "./EventManager"
import { LocalMsg } from "../Type"

export class webSocketClient extends WebSocket {
    public uuid: string
    public heartbeatTimer: number
    public heartbeatInterval: NodeJS.Timeout
    public lastHearbeatTime: number
}




export class NetManager extends BaseManager {
    static webSocket: WebSocketServer
    static clientsMap: Map<string, webSocketClient> = new Map()
    static heartbeatTimer: number = 5000
    static heartbeatTimeoutTimer: number = 30


    static init() {
        this.webSocket = new WebSocketServer({ port: 8888, maxPayload: 1024 })
        this.webSocket.on("connection", (ws: webSocketClient) => {
            ws.uuid = v1()

            ws.on("close", function (this: webSocketClient) { NetManager.clientClose(this) })
            ws.on("message", this.recvData)

            ws.lastHearbeatTime = Math.ceil(Date.now() / 1000)
            ws.heartbeatInterval = setInterval(this.sendHeartbeat.bind(this), NetManager.heartbeatTimer, ws)

            this.clientsMap.set(ws.uuid, ws)
            this.sendData(ws, EnumProtoId.S2C_Login, { uuid: ws.uuid })
        })


    }

    static recvData(this: webSocketClient, data: Buffer) {
        const commonData = pb.decodeCommonData(data)
        const protoName = protoId2Name[commonData.protoId]
        const dataBody = pb[`decode${protoName}`](commonData.body)

        // 暂且消息处理在这分发，后端不太擅长，不知道如何设计，先放着堆吧
        if (commonData.protoId == EnumProtoId.C2S_HeartBeat) {
            NetManager.recvHeartbeat(this)
        }

        console.log(`[recvData]:${commonData.protoId}|${protoName}`, dataBody, this.uuid)
        EventManager.emit(protoName, dataBody, this)
    }

    static sendData(ws: webSocketClient, protoId: number, data: any) {
        const protoName = protoId2Name[protoId]
        const dataBody = pb[`encode${protoName}`](data)
        const commonData = { protoId: protoId, body: dataBody }
        ws.send(pb.encodeCommonData(commonData), { binary: true })
        if (protoId == EnumProtoId.S2C_Frames) return
        console.log(`[sendData]:${protoId}|${protoName}`, data, ws.uuid)
    }

    static sendHeartbeat(ws: webSocketClient) {
        const serverTime = Math.ceil(Date.now() / 1000)

        if (ws.lastHearbeatTime && (serverTime - Number(ws.lastHearbeatTime)) >= NetManager.heartbeatTimeoutTimer) {
            clearInterval(ws.heartbeatInterval)
            return ws.close()
        }
        this.sendData(ws, EnumProtoId.S2C_HeartBeat, { serverTime: serverTime } as pb.S2C_HeartBeat)
    }

    static recvHeartbeat(ws: webSocketClient) {
        ws.lastHearbeatTime = Math.ceil(Date.now() / 1000)
    }

    static broadcastMessage(clientsUuid: Array<string>, protoId: number, data: any) {
        for (const uuid of clientsUuid) {
            const client = this.clientsMap.get(uuid)
            if (client.readyState != WebSocket.OPEN) continue
            this.sendData(client, protoId, data)
        }
    }

    static broadcastMessageOne(clientUuid: string, protoId: number, data: any) {
        const client = this.clientsMap.get(clientUuid)
        this.sendData(client, protoId, data)
    }

    static broadcastMessageAll(protoId: number, data: any) {
        for (const [clientUuid, client] of this.clientsMap) {
            if (client.readyState != WebSocket.OPEN) continue
            this.sendData(client, protoId, data)
        }
    }

    static clientClose(ws: webSocketClient) {
        if (ws.heartbeatInterval) {
            clearInterval(ws.heartbeatInterval)
        }
        
        NetManager.clientsMap.delete(ws.uuid)
        EventManager.emit(LocalMsg.EnumLocalMsg.ClientClose, { uuid: ws.uuid })
        console.log(`[clientClose]:${ws.uuid}`)
    }




}


