import { EnumProtoName } from "Proto/protoMap";
import { EventManager } from "./EventManager";
import { webSocketClient } from "./NetManager"
import { LocalMsg } from "../Type";

export class BaseManager {

    static registerListener(eventName: EnumProtoName, callback: (recvData, webSocketClient: webSocketClient) => void, target?: any) {
        EventManager.on(eventName, callback, target)
    }

    static registerListenerLocal(eventName: LocalMsg.EnumLocalMsg, callback: (param: any) => void, target?: any) {
        EventManager.on(eventName, callback, target)
    }
}