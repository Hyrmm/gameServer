export const protoId2Name: { [protoId: number]: string } = {
    1000: "S2C_HeartBeat",
    1001: "C2S_HeartBeat",
    1002: "S2C_Frames",
    1003: "C2S_Frames",
    1004: "S2C_PlayerJoin",
    1005: "S2C_PlayerLeave"
}

export const protoName2Id: { [protoName: string]: number } = {
    S2C_HeartBeat: 1000,
    C2S_HeartBeat: 1001,
    S2C_Frames: 1002,
    C2S_Frames: 1003,
    S2C_PlayerJoin: 1004,
    S2C_PlayerLeave: 1005
}

export enum EnumProtoId {
    S2C_HeartBeat = 1000,
    C2S_HeartBeat = 1001,
    S2C_Frames = 1002,
    C2S_Frames = 1003,
    S2C_PlayerJoin = 1004,
    S2C_PlayerLeave = 1005
}

export enum EnumProtoName {
    S2C_HeartBeat = "S2C_HeartBeat",
    C2S_HeartBeat = "C2S_HeartBeat",
    S2C_Frames = "S2C_Frames",
    C2S_Frames = "C2S_Frames",
    S2C_PlayerJoin = "S2C_PlayerJoin",
    S2C_PlayerLeave = "S2C_PlayerLeave"
}