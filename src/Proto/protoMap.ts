export const protoId2Name: { [protoId: number]: string } = {
    1000: "S2C_HeartBeat",
    1001: "C2S_HeartBeat",
    1002: "S2C_Frames",
    1003: "C2S_Frames",
    1004: "S2C_PlayerJoin",
    1005: "C2S_PlayerJoin",
    1006: "S2C_PlayerLeave",
    1007: "S2C_Login",
    1008: "C2S_Login",
    1009: "S2C_SyncRoomStatus"
}

export const protoName2Id: { [protoName: string]: number } = {
    S2C_HeartBeat: 1000,
    C2S_HeartBeat: 1001,
    S2C_Frames: 1002,
    C2S_Frames: 1003,
    S2C_PlayerJoin: 1004,
    C2S_PlayerJoin: 1005,
    S2C_PlayerLeave: 1006,
    S2C_Login: 1007,
    C2S_Login: 1008,
    S2C_SyncRoomStatus: 1009
}

export enum EnumProtoId {
    S2C_HeartBeat = 1000,
    C2S_HeartBeat = 1001,
    S2C_Frames = 1002,
    C2S_Frames = 1003,
    S2C_PlayerJoin = 1004,
    C2S_PlayerJoin = 1005,
    S2C_PlayerLeave = 1006,
    S2C_Login = 1007,
    C2S_Login = 1008,
    S2C_SyncRoomStatus = 1009
}

export enum EnumProtoName {
    S2C_HeartBeat = "S2C_HeartBeat",
    C2S_HeartBeat = "C2S_HeartBeat",
    S2C_Frames = "S2C_Frames",
    C2S_Frames = "C2S_Frames",
    S2C_PlayerJoin = "S2C_PlayerJoin",
    C2S_PlayerJoin = "C2S_PlayerJoin",
    S2C_PlayerLeave = "S2C_PlayerLeave",
    S2C_Login = "S2C_Login",
    C2S_Login = "C2S_Login",
    S2C_SyncRoomStatus = "S2C_SyncRoomStatus"
}