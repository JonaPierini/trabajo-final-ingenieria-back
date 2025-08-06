import mongoose from "mongoose";

//Aca voy a definir mis entidades (que seria mis talbas de la base de datos)

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  provinces: {
    type: String,
    required: true,
  },
  state: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Si no se proporciona, se usará la fecha actual
  },
});

//CON ESTE ESQUEMA CREO MI MODELO QUE VA A SER COMO INTERACTUO CON LA BASE DE DATOS

export const ClientModel = mongoose.model("Client", clientSchema);
