import { connect } from 'mongoose'
import { envs } from '../config/envs'


export class DbConecction {
    constructor() { }

    public connection = async () => {
        try {
            await connect(envs.MONGODB_CNN);
            console.log('Conexión a la base de datos exitosa');
        } catch (error) {
            console.error('Error en la conexión con la base de datos:', error);
            throw new Error('Error en la conexión con la base de datos');
        }


    }
}