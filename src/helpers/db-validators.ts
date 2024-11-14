import { isValidObjectId } from "mongoose";
import { UserModel } from "../presentation/models/user.model";
import { CategoryModel } from "../presentation/models/category.model";
import { ProductoModel } from "../presentation/models/product.model";
import { ClientModel } from "../presentation/models/client.model";

export const UserEmailExist = async (email: String) => {
  const emailExist = await UserModel.findOne({ email });
  if (emailExist) {
    throw new Error(`El correo: ${email}, ya está registrado`);
  }
};

export const UserIdExist = async (id: String) => {
  // Verificar si el id es válido respcto al validObjetId
  if (!isValidObjectId(id)) {
    throw new Error(`El id: ${id}, no es un ObjectId válido.`);
  }
  // Verificar si el ID existe
  const userId = await UserModel.findById(id);
  if (!userId) {
    throw new Error(`El id: ${id}, no existe en la BD`);
  }
};

export const CategoryIdExist = async (id: String) => {
  // Verificar si el id es válido respcto al validObjetId
  if (!isValidObjectId(id)) {
    throw new Error(`El id: ${id}, no es un ObjectId válido.`);
  }
  // Verificar si el ID existe
  const categoryId = await CategoryModel.findById(id);
  if (!categoryId) {
    throw new Error(`El id: ${id}, no existe en la BD`);
  }
};

export const ProductIdExist = async (id: String) => {
  // Verificar si el id es válido respcto al validObjetId
  if (!isValidObjectId(id)) {
    throw new Error(`El id: ${id}, no es un ObjectId válido.`);
  }
  // Verificar si el ID existe
  const productId = await ProductoModel.findById(id);
  if (!productId) {
    throw new Error(`El id: ${id}, no existe en la BD`);
  }
};

export const ClientEmailExist = async (email: String) => {
  const emailExist = await ClientModel.findOne({ email });
  if (emailExist) {
    throw new Error(`El correo: ${email}, ya está registrado`);
  }
};
