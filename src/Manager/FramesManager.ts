
import { PlayerMove, S2C_Frames } from "Proto/pb"
import { NetManager } from "./NetManager"
export class FramesManager {
    static pendingFrame: S2C_Frames = { timePast: 0, frames: 0, playerMove: [] }

    static init() {
        setInterval(this.async.bind(this), 100)
    }

    static async() {
        this.resetFrames()

        const data: S2C_Frames = this.pendingFrame
        data.timePast = Math.floor(process.uptime())
        data.frames += 1
        NetManager.broadcastMessage(1002, data)
    }


    static applyInputs(inupt: PlayerInput) {
        if (inupt.playerMove) {
            this.pendingFrame.playerMove.push(inupt.playerMove)
        }
    }


    static resetFrames() {
        this.pendingFrame.playerMove = []
    }



}
interface PlayerInput {
    playerMove: PlayerMove
}