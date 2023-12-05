


import { EnumProtoId } from "../../Proto/protoMap"
import { NetManager } from "../../Manager/NetManager"
import { Formater } from "../../Utils/Formater"
import { Player } from "../Player/Player"
import { RoomFramesMgr } from "./RoomFramesMgr"

import * as pb from "../../Proto/pb"


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

    public applyFrames(frames: pb.C2S_Frames) {
        this.framesMgr.applyFrames(frames)
    }

    public notifyPlayerJoin(joinedPlayer: Player) {
        const curRoomAllPlayersUuid = this.allPlayersUuid
        const playerPos = Formater.wrap2TowInt(joinedPlayer.positionX, joinedPlayer.positionY)
        const playerVelocity = Formater.wrap2TowInt(joinedPlayer.velocityX, joinedPlayer.velocityY)
        const sendData: pb.S2C_PlayerJoin = { uuid: joinedPlayer.uuid, position: playerPos, velocity: playerVelocity }
        NetManager.broadcastMessage(curRoomAllPlayersUuid, EnumProtoId.S2C_PlayerJoin, sendData)
    }

    public notifyPlayerLeave(leavedPlayer: Player) {
        const curRoomAllPlayersUuid = this.allPlayersUuid
        const sendData: pb.S2C_PlayerLeave = { uuid: leavedPlayer.uuid }
        NetManager.broadcastMessage(curRoomAllPlayersUuid, EnumProtoId.S2C_PlayerLeave, sendData)
    }

    public notifyRoomStatus(recvdPlayer: Player) {
        const curRoomAllPlayers = this.allPlayers

        // 处理数据
        const players: Array<pb.Player> = []
        for (const player of curRoomAllPlayers) {
            const playerPos = Formater.wrap2TowInt(player.positionX, player.positionY)
            const playerVelocity = Formater.wrap2TowInt(player.velocityX, player.velocityY)
            players.push({ uuid: player.uuid, position: playerPos, velocity: playerVelocity })
        }

        const sendData: pb.S2C_SyncRoomStatus = { players: players }
        NetManager.broadcastMessageOne(recvdPlayer.uuid, EnumProtoId.S2C_SyncRoomStatus, sendData)
    }



    public get allPlayers(): Array<Player> {
        return [...this.playersMap.values()]
    }

    public get allPlayersUuid(): Array<string> {
        return [...this.playersMap.keys()]
    }
}

