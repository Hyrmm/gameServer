import { BaseManager } from "./BaseManager"
import { createPool, Pool, PoolConfig } from "mysql"
export class DatabaseManager extends BaseManager {
    static config: PoolConfig = {
        host: 'sh-cynosdbmysql-grp-qbmsgrx2.sql.tencentcdb.com',
        port: 21051,
        user: 'root',
        password: 'Woshihanjun123',
        database: 'game'
    }


    static sqlPool: Pool


    static init() {
        this.sqlPool = createPool(this.config)
    }


    static sqlQuery(sql: string): Promise<any> {

        

        return new Promise((resolve, reject) => {
            this.sqlPool.getConnection((err, connection) => {

                if (err) {
                    return reject(err)
                }

                connection.query(sql, (err, result) => {
                    //释放连接
                    connection.release()
                    if (err) {
                        return reject(err)
                    }
                    resolve(result)
                });
            })
        })
    }
}