import { DbConecction } from "./database/config"
import { Server } from "./presentation/server"




(async () => {
    main()
})()


async function main() {

    //CONEXION A BASE DE DATOS
    const dbConnection = new DbConecction()
    dbConnection.connection()

    //CREACION DEL SERVIDOR
    const server = new Server()
    server.start()

}