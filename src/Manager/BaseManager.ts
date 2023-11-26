import { EnumProtoName } from "Proto/protoMap";
import { EventManager } from "./EventManager";
import { EnumLocalMsg } from "Config/Enum";

export class BaseManager {
    static registerListener(eventName: EnumProtoName, callback: (recvData) => void, target?: any) {
        EventManager.on(eventName, callback, target)
    }

    static registerListenerLocal(eventName: EnumLocalMsg, callback: (param: any) => void, target?: any) {
        EventManager.on(eventName, callback, target)
    }
}