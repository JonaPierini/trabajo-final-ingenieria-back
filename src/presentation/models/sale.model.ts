import mongoose, { Schema } from "mongoose";

//Aca voy a definir mis entidades (que seria mis talbas de la base de datos)

const saleSchema = new mongoose.Schema({
  //User que hizo la venta
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  //Cliente a quien le hago la venta
  client: {
    type: Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  //Producto vendido
  product: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  total: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Si no se proporciona, se usará la fecha actual
  },
});

//CON ESTE ESQUEMA CREO MI MODELO QUE VA A SER COMO INTERACTUO CON LA BASE DE DATOS

export const SaleModel = mongoose.model("Sale", saleSchema);
