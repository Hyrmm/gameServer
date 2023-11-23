

export interface I_InputsType {
    playerMove?: T_PlayerMove
}

export type T_PlayerMove = {
    playerId: number, dt: number, velocityX?: number, velocityY?: number
}