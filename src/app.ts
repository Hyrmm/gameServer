import { DatabaseManager } from "./Manager/DatabaseManager";
import { NetManager } from "./Manager/NetManager";
import { RoomsManager } from "./Manager/RoomsManager";













DatabaseManager.init()
NetManager.init()
RoomsManager.init()
DatabaseManager.sqlQuery('SELECT * FROM user').then((result) => {
    console.log(result)
})
DatabaseManager.sqlQuery('SELECT * FROM user').then((result) => {
    console.log(result)
})
DatabaseManager.sqlQuery('SELECT * FROM user').then((result) => {
    console.log(result)
})
DatabaseManager.sqlQuery('SELECT * FROM user').then((result) => {
    console.log(result)
})
DatabaseManager.sqlQuery('SELECT * FROM user').then((result) => {
    console.log(result)
})