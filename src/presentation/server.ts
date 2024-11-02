import express from 'express'
import { envs } from '../config/envs'
import cors from 'cors'
import { AppRoutes } from './routes/routes';
import path from 'path';

export class Server {
    private app = express()

    async start() {

        // Use CORS middleware
        this.app.use(cors());

        // Middleware para parsear la informacion que viene en el body y la transforma en json
        this.app.use(express.json());

        //Middleware que nos permite leer la información que viene en formato x-www-form-urlencoded. Generalmente en Angular
        this.app.use(express.urlencoded({ extended: true }));

        //ROUTES CON CLASE
        this.app.use(AppRoutes.routes)

        //SI INGRESA A CUALQUIER RUTA SE MUESTRA LO QUE ESTA EN EL INDEX
        this.app.get('*', (req, res) => {
            const indexPath = path.join(__dirname, '../../public/index.html')
            res.sendFile(indexPath)

        })
        //PARA INICIAR EL SERVIDOR
        this.app.listen(envs.PORT, () => {
            console.log(`Server corriendo en ${envs.PORT}`)
        })
    }

}