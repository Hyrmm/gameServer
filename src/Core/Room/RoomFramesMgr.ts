import { Room } from "./Room"
import * as pb from "../../Proto/proto"
import { Input } from "../../Type"
import { Player } from "../Player/Player"
import { NetManager } from "../../Manager/NetManager"
import { EnumProtoId } from "../../Proto/protoMap"
import { Formater } from "../../Utils/Formater"
export class BaseRoomFramesMgr {
    public room: Room
    protected pendingFrame: pb.S2C_Frames
    protected historyFrames: Array<pb.S2C_Frames>
    constructor(room: Room) {
        this.room = room
        setInterval(this.syncFrames.bind(this), 100)
    }

    protected syncFrames() {
        // 同步帧数和时间
        this.pendingFrame.timePast = Math.floor(process.uptime())
        this.pendingFrame.frames += 1

        const frames = this.pendingFrame.frames
        const timePast = this.pendingFrame.timePast
        const playerJoin = this.pendingFrame.playerJoin
        const playerLeave = this.pendingFrame.playerLeave

        // 合并玩家移动
        const playerMove = this.mergePlayerMoveInputs()

        const data: pb.S2C_Frames = { timePast, frames, playerMove, playerJoin, playerLeave }
        this.room.syncFrames(data)
        this.historyFrames.push(data)
        this.resetFrames()
    }

    public applyFrames(frames: pb.C2S_Frames) {
        if (frames.playerMove) {
            this.pendingFrame.playerMove.push(frames.playerMove)
        }
    }

    public applyPlayerJoinFrame(player: Player) {
        const position = Formater.wrap2TowInt(player.positionX, player.positionY)
        const velocity = Formater.wrap2TowInt(player.velocityX, player.velocityY)
        this.pendingFrame.playerJoin.push({ player: { uuid: player.uuid, position, velocity } })
    }

    public applyPlayerLeaveFrame(player: Player) {
        const position = Formater.wrap2TowInt(player.positionX, player.positionY)
        const velocity = Formater.wrap2TowInt(player.velocityX, player.velocityY)
        this.pendingFrame.playerLeave.push({ player: { uuid: player.uuid, position, velocity } })
    }

    public slicedHistoryFrames(startIndex: number, recvdPlayer: Player) {
        let hasNextTick = true
        let isSyncFinish = false
        let endIndex = startIndex + 100

        if (endIndex > this.historyFrames.length) {
            isSyncFinish = true
            hasNextTick = false
            endIndex = this.historyFrames.length
        }

        const frames: Array<pb.S2C_Frames> = this.historyFrames.slice(startIndex, endIndex)
        const sendData: pb.S2C_SyncRoomStatus = { frames: frames, isSyncFinish: isSyncFinish ? 1 : 0 }
        NetManager.broadcastMessageOne(recvdPlayer.uuid, EnumProtoId.S2C_SyncRoomStatus, sendData)

        // 根据分割的范围判断下次事件循环是否继续同步
        if (hasNextTick) {
            setImmediate(this.slicedHistoryFrames.bind(this), endIndex, recvdPlayer)
        }
    }

    private resetFrames() {
        this.pendingFrame.playerMove = []
        this.pendingFrame.playerJoin = []
        this.pendingFrame.playerLeave = []
    }

    private mergePlayerMoveInputs(): Array<Input.TypePlayerMove> {

        let mergedPlayerMoveInputs: Array<Input.TypePlayerMove> = []

        if (this.pendingFrame.playerMove.length > 0) {

            const playerMove: Map<string, Input.TypePlayerMove> = new Map()

            for (const playerData of this.pendingFrame.playerMove) {
                // 合并玩家移动数据，只针对时间的累积，速度不处理
                let coverPlayerData: Input.TypePlayerMove
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

}

export class RoomFramesMgr extends BaseRoomFramesMgr {
    protected pendingFrame: pb.S2C_Frames = { timePast: 0, frames: 0, playerMove: [], playerJoin: [], playerLeave: [] }
    protected historyFrames: Array<pb.S2C_Frames> = []
}