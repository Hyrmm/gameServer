import { EnumProtoId, EnumProtoName } from "../Proto/protoMap"
import { BaseManager } from "./BaseManager"
import { NetManager, webSocketClient } from "./NetManager"
import * as pb from "../Proto/proto"
import { LocalMsg, Input } from "../Type"
import { Room } from "../Core/Room/Room"


export class RoomsManager extends BaseManager {
    static roomsMap: Map<string, Room> = new Map()

    static init() {
        this.roomsMap.set("defult", new Room())

        this.registerListener(EnumProtoName.C2S_Frames, this.parseFrames, this)
        this.registerListener(EnumProtoName.C2S_PlayerJoin, this.parsePlayerJoin, this)
        this.registerListener(EnumProtoName.C2S_PlayerLeave, this.parsePlayerLeave, this)

        this.registerListenerLocal(LocalMsg.EnumLocalMsg.ClientClose, this.handlePlayerDisconnect, this)
    }

    static parseFrames(recvData: pb.C2S_Frames, webSocketClient: webSocketClient) {
        const room = this.roomsMap.get("defult")
        room.applyFrames(recvData)
    }

    static parsePlayerJoin(recvData: pb.C2S_PlayerJoin, webSocketClient: webSocketClient) {
        const room = this.roomsMap.get("defult")
        const player = room.addPlayer(webSocketClient.uuid)
        room.applyPlayerJoin(player)
        room.syncHistoryFrames(player)
    }

    static parsePlayerLeave(recvData: pb.C2S_PlayerLeave, webSocketClient: webSocketClient) {
        const room = this.roomsMap.get("defult")
        const player = room.getPlayerByUuid(webSocketClient.uuid)
        if (player) {
            room.delPlayer(player.uuid)
            room.applyPlayerLeave(player)
        }
    }

    static handlePlayerDisconnect(param) {
        const room = this.roomsMap.get("defult")
        const player = room.getPlayerByUuid(param.uuid)
        if (player) {
            room.delPlayer(player.uuid)
            room.applyPlayerLeave(player)
        }
    }
}

