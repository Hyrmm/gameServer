
import { PlayerMove, S2C_Frames } from "Proto/pb"
import { NetManager } from "./NetManager"
import { I_InputsType, T_PlayerMove } from "Config/Interface"
export class FramesManager {
    static pendingFrame: S2C_Frames = { timePast: 0, frames: 0, playerMove: [] }

    static init() {
        setInterval(this.syncFrames.bind(this), 100)
    }

    static syncFrames() {
        // 同步帧数和时间
        this.pendingFrame.timePast = Math.floor(process.uptime())
        this.pendingFrame.frames += 1

        // 合并消息帧
        const data: S2C_Frames = { timePast: this.pendingFrame.timePast, frames: this.pendingFrame.frames }

        // 玩家移动合并
        const mergedPlayerMoveInputs = this.mergePlayerMoveInputs()
        if (mergedPlayerMoveInputs.length) {
            data.playerMove = mergedPlayerMoveInputs
        }



        NetManager.broadcastMessage(1002, data)
        this.resetFrames()
    }

    static applyFrames(inupt: I_InputsType) {
        if (inupt.playerMove) {
            this.pendingFrame.playerMove.push(inupt.playerMove)
        }
    }

    static mergePlayerMoveInputs(): Array<T_PlayerMove> {

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
    static resetFrames() {
        this.pendingFrame.playerMove = []
    }



}