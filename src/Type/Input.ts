export type TypePlayerMove = { playerId: number, dt: number, velocityX?: number, velocityY?: number }
export type InputsType = { playerMove?: TypePlayerMove }




export enum EnumInputTypeName {
    PlayerMove = "PlayerMove"
}