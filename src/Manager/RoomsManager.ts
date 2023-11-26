import { EnumProtoId, EnumProtoName } from "../Proto/protoMap"
import { BaseManager } from "./BaseManager"
import { NetManager, webSocketClient } from "./NetManager"
import * as pb from "../Proto/pb"
import { EnumLocalMsg } from "../Config/Enum"
import { I_InputsType, T_PlayerMove } from "Config/Interface"


export class RoomsManager extends BaseManager {
    static roomsMap: Map<string, Room> = new Map()

    static init() {
        this.roomsMap.set("defult", new Room())

        this.registerListener(EnumProtoName.C2S_Frames, this.parseFrames, this)
        this.registerListener(EnumProtoName.C2S_PlayerJoin, this.parsePlayerJoin, this)

        this.registerListenerLocal(EnumLocalMsg.ClientClose, this.handlePlayerDisconnect, this)
    }

    static parseFrames(recvData: pb.C2S_Frames) {
        const room = this.roomsMap.get("defult")
        room.applyFrames(recvData)
    }

    static parsePlayerJoin(recvData: pb.C2S_PlayerJoin) {
        const room = this.roomsMap.get("defult")
        const player = room.addPlayer(recvData.uuid)
        this.applyPlayerJoin(room, player)
        this.applySycnRoomStatus(room, player)
    }

    static applyPlayerJoin(room: Room, player: Player) {
        const curRoomAllPlayersUuid = room.allPlayersUuid
        const playerPos = { v1: player.positionX, v2: player.positionY }
        const playerVelocity = { v1: player.velocityX, v2: player.velocityY }
        const sendData: pb.S2C_PlayerJoin = { uuid: player.uuid, position: playerPos, velocity: playerVelocity }
        NetManager.broadcastMessage(curRoomAllPlayersUuid, EnumProtoId.S2C_PlayerJoin, sendData)
    }

    static applySycnRoomStatus(room: Room, player: Player) {
        const curRoomAllPlayers = room.allPlayers

        // 处理数据
        const players: Array<pb.Player> = []
        for (const palyer of curRoomAllPlayers) {
            players.push({ uuid: palyer.uuid, position: { v1: player.positionX, v2: player.positionY }, velocity: { v1: player.velocityX, v2: player.velocityY } })
        }

        const sendData: pb.S2C_SyncRoomStatus = { players: players }
        NetManager.broadcastMessageOne(player.uuid, EnumProtoId.S2C_SyncRoomStatus, sendData)
    }

    static applyPlayerLeave(room: Room, player: Player) {
        const curRoomAllPlayersUuid = room.allPlayersUuid
        const sendData: pb.S2C_PlayerLeave = { uuid: player.uuid }
        NetManager.broadcastMessage(curRoomAllPlayersUuid, EnumProtoId.S2C_PlayerLeave, sendData)
    }

    static handlePlayerDisconnect(param) {
        const room = this.roomsMap.get("defult")
        const player = room.getPlayerByUuid(param.uuid)

        if (player) {
            const delResult = room.delPlayer(player.uuid)
            if (delResult) {
                this.applyPlayerLeave(room, player)
            }
        }

    }
}



export class Room {
    private playersMap: Map<string, Player> = new Map()
    private framesMachine: FramesMachine

    constructor() {
        this.framesMachine = new FramesMachine(this)
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
        this.framesMachine.applyFrames(frames)
    }

    public get allPlayers(): Array<Player> {
        return [...this.playersMap.values()]
    }

    public get allPlayersUuid(): Array<string> {
        return [...this.playersMap.keys()]
    }
}

export class BaseFramesMachine {
    public room: Room
    public pendingFrame: pb.S2C_Frames

    constructor(room: Room) {
        this.room = room
        setInterval(this.syncFrames.bind(this), 100)
    }

    protected syncFrames() {
        // 同步帧数和时间
        this.pendingFrame.timePast = Math.floor(process.uptime())
        this.pendingFrame.frames += 1

        // 合并消息帧
        const data: pb.S2C_Frames = { timePast: this.pendingFrame.timePast, frames: this.pendingFrame.frames }

        // 玩家移动合并
        const mergedPlayerMoveInputs = this.mergePlayerMoveInputs()
        if (mergedPlayerMoveInputs.length) {
            data.playerMove = mergedPlayerMoveInputs
        }

        this.room.syncFrames(data)
        this.resetFrames()
    }

    public applyFrames(frames: pb.C2S_Frames) {
        if (frames.playerMove) {
            this.pendingFrame.playerMove.push(frames.playerMove)
        }
    }

    protected mergePlayerMoveInputs(): Array<T_PlayerMove> {

        let mergedPlayerMoveInputs: Array<T_PlayerMove> = []

        if (this.pendingFrame.playerMove.length > 0) {

            const playerMove: Map<number, T_PlayerMove> = new Map()

            for (const playerData of this.pendingFrame.playerMove) {
                // 合并玩家移动数据，只针对时间的累积，速度不处理
                let coverPlayerData: T_PlayerMove
                const lastPlayerData = playerMove.get(playerData.playerId)

                if (lastPlayerData) {
                    const coverDt = lastPlayerData.dt + playerData.dt
                    coverPlayerData = { playerId: playerData.playerId, velocityX: playerData.velocityX, velocityY: playerData.velocityY, dt: coverDt }
                } else {
                    coverPlayerData = playerData
                }

                playerMove.set(playerData.playerId, coverPlayerData)
            }

            mergedPlayerMoveInputs = [...playerMove.values()]
        }
        return mergedPlayerMoveInputs
    }

    protected resetFrames() {
        this.pendingFrame.playerMove = []
    }
}

export class FramesMachine extends BaseFramesMachine {
    public pendingFrame: pb.S2C_Frames = { timePast: 0, frames: 0, playerMove: [] }
}


export class Player {
    public uuid: string
    public positionX: number
    public positionY: number
    public velocityX: number
    public velocityY: number

    constructor(playerUuid: string) {
        this.uuid = playerUuid
        this.positionX = 0
        this.positionY = 0
        this.velocityX = 0
        this.velocityY = 0
    }
}