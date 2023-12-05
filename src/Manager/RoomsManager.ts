import { EnumProtoId, EnumProtoName } from "../Proto/protoMap"
import { BaseManager } from "./BaseManager"
import { NetManager, webSocketClient } from "./NetManager"
import * as pb from "../Proto/pb"
import { LocalMsg, Input } from "../Type"
import { Room } from "../Core/Room/Room"


export class RoomsManager extends BaseManager {
    static roomsMap: Map<string, Room> = new Map()

    static init() {
        this.roomsMap.set("defult", new Room())

        this.registerListener(EnumProtoName.C2S_Frames, this.parseFrames, this)
        this.registerListener(EnumProtoName.C2S_PlayerJoin, this.parsePlayerJoin, this)

        this.registerListenerLocal(LocalMsg.EnumLocalMsg.ClientClose, this.handlePlayerDisconnect, this)
    }

    static parseFrames(recvData: pb.C2S_Frames) {
        const room = this.roomsMap.get("defult")
        room.applyFrames(recvData)
    }

    static parsePlayerJoin(recvData: pb.C2S_PlayerJoin) {
        const room = this.roomsMap.get("defult")
        const player = room.addPlayer(recvData.uuid)
        room.notifyPlayerJoin(player)
        room.notifyRoomStatus(player)
    }


    static handlePlayerDisconnect(param) {
        const room = this.roomsMap.get("defult")
        const player = room.getPlayerByUuid(param.uuid)
        if (player) {
            room.delPlayer(player.uuid)
            room.notifyPlayerLeave(player)

        }
    }
}

