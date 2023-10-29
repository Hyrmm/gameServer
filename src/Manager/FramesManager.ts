
import { PlayerMove, S2C_Frames } from "Proto/pb"
import { NetManager } from "./NetManager"
export class FramesManager {
    static pendingFrame: S2C_Frames = {
        timePast: ""
    }




    static init() {
        setInterval(this.async.bind(this), 100)
    }

    static async() {
        const data: S2C_Frames = this.pendingFrame
        data.timePast = String(process.uptime() * 1000)

        this.resetFrames()

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