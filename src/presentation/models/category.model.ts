import mongoose, { Schema } from "mongoose";

//Aca voy a definir mis entidades (que seria mis talbas de la base de datos)

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    unique: true,
  },
  state: {
    type: Boolean,
    default: true,
    required: true,
  },
  //usuario que creo la categoria
  user: {
    type: Schema.Types.ObjectId,
    //aca voy a hacer referencia al otro modelo (User). Si o Si mismo nombre => que esta aca export const UserModel = mongoose.model('User', userSchema)
    ref: "User",
    required: true,
  },
});

//CON ESTE ESQUEMA CREO MI MODELO QUE VA A SER COMO INTERACTUO CON LA BASE DE DATOS

export const CategoryModel = mongoose.model("Category", categorySchema);
