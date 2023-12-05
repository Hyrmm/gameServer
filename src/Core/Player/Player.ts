import { BasePlayer } from "./BasePlayer"

export class Player extends BasePlayer {
    public positionX: number
    public positionY: number
    public velocityX: number
    public velocityY: number

    constructor(playerUuid: string) {
        super(playerUuid)
        this.positionX = 0
        this.positionY = 0
        this.velocityX = 0
        this.velocityY = 0
    }
}