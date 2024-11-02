import mongoose from "mongoose"

//Aca voy a definir mis entidades (que seria mis talbas de la base de datos)

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        emun: ['ADMIN_ROLE', 'USER_ROLE'],
        default: 'USER_ROLE'
    },
    state: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now  // Si no se proporciona, se usará la fecha actual
    }
})

//CON ESTE ESQUEMA CREO MI MODELO QUE VA A SER COMO INTERACTUO CON LA BASE DE DATOS

export const UserModel = mongoose.model('User', userSchema)