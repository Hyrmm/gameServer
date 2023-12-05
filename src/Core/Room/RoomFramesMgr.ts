import { Room } from "./Room"
import * as pb from "../../Proto/pb"
import { Input } from "../../Type"
export class BaseRoomFramesMgr {
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

    protected mergePlayerMoveInputs(): Array<Input.TypePlayerMove> {

        let mergedPlayerMoveInputs: Array<Input.TypePlayerMove> = []

        if (this.pendingFrame.playerMove.length > 0) {

            const playerMove: Map<number, Input.TypePlayerMove> = new Map()

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

    protected resetFrames() {
        this.pendingFrame.playerMove = []
    }
}

export class RoomFramesMgr extends BaseRoomFramesMgr {
    public pendingFrame: pb.S2C_Frames = { timePast: 0, frames: 0, playerMove: [] }
}