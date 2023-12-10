


import { EnumProtoId } from "../../Proto/protoMap"
import { NetManager } from "../../Manager/NetManager"
import { Formater } from "../../Utils/Formater"
import { Player } from "../Player/Player"
import { RoomFramesMgr } from "./RoomFramesMgr"

import * as pb from "../../Proto/proto"


export class Room {
    private playersMap: Map<string, Player> = new Map()
    private framesMgr: RoomFramesMgr

    constructor() {
        this.framesMgr = new RoomFramesMgr(this)
    }

    public addPlayer(playerUuid: string): Player {
        const player = new Player(playerUuid)
        this.playersMap.set(playerUuid, player)
        return player
    }

    public delPlayer(playerUuid: string): boolean {
        return this.playersMap.delete(playerUuid)
    }

    public getPlayerByUuid(playerUuid: string): Player {
        return this.playersMap.get(playerUuid)
    }

    public syncFrames(frames: pb.S2C_Frames) {
        NetManager.broadcastMessage(this.allPlayersUuid, EnumProtoId.S2C_Frames, frames)
    }

    public syncHistoryFrames(recvdPlayer: Player) {
        // 同步所有历史帧，分块同步给新加入客户端，防止长时间堵塞事件循环队列
        this.framesMgr.slicedHistoryFrames(0, recvdPlayer)
    }

    public applyFrames(frames: pb.C2S_Frames) {
        this.framesMgr.applyFrames(frames)
    }

    public applyPlayerJoin(joinedPlayer: Player) {
        this.framesMgr.applyPlayerJoinFrame(joinedPlayer)
    }

    public applyPlayerLeave(leavedPlayer: Player) {
        this.framesMgr.applyPlayerLeaveFrame(leavedPlayer)
    }

    public get allPlayers(): Array<Player> {
        return [...this.playersMap.values()]
    }

    public get allPlayersUuid(): Array<string> {
        return [...this.playersMap.keys()]
    }
}

