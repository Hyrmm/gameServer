export class BasePlayer {
    public uuid: string
    public role: string
    constructor(playerUuid: string) {
        this.uuid = playerUuid
        this.role = ["playerDoux", "playerMort", "playerTard", "playerVita"][Math.floor(Math.random() * 4)]
    }
}