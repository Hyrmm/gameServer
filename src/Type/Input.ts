





export type TypePlayerMove = { playerId: string, dt: number, velocityX?: number, velocityY?: number }
export type TypePlayerJoin = { player: TypePlayer }

export type InputsType = { playerMove?: TypePlayerMove }
export type TypePlayer = { uuid: string, position: { v1: number, v2: number }, velocity: { v1: number, v2: number } }




export enum EnumInputTypeName {
    PlayerMove = "PlayerMove"
}