import { isValidObjectId } from "mongoose";
import { UserModel } from "../presentation/models/user.model";
import { CategoryModel } from "../presentation/models/category.model";
import { ProductoModel } from "../presentation/models/product.model";
import { ClientModel } from "../presentation/models/client.model";
import { Request } from "express";
import { CustomValidator, Meta } from "express-validator";
import { BudgetModel } from "../presentation/models/budget.model";

export const UserEmailExist = async (email: String) => {
  const emailExist = await UserModel.findOne({ email });
  if (emailExist) {
    throw new Error(`El correo: ${email}, ya está registrado`);
  }
};

export const UserEmailExistUpdate: CustomValidator = async (email, meta) => {
  const req = meta.req as Request;
  const userId = req.params.id;
  const existingUser = await UserModel.findOne({ email });

  if (existingUser && existingUser._id.toString() !== userId) {
    throw new Error(`El correo: ${email}, ya está registrado por otro usuario`);
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

export const BudgetIdExist = async (id: String) => {
  // Verificar si el id es válido respcto al validObjetId
  if (!isValidObjectId(id)) {
    throw new Error(`El id: ${id}, no es un ObjectId válido.`);
  }
  // Verificar si el ID existe
  const budgetId = await BudgetModel.findById(id);
  if (!budgetId) {
    throw new Error(`El id: ${id}, no existe en la BD`);
  }
};

// export const ClientEmailExist = async (email: String) => {
//   const emailLower = email.toLowerCase(); // 🔽 convertís a minúsculas
//   const emailExist = await ClientModel.findOne({ email: emailLower });
//   if (emailExist) {
//     throw new Error(`El correo: ${email}, ya está registrado`);
//   }
// };

// Ahora acepta el `req` para acceder al ID del cliente que se edita
export const ClientEmailExist = async (email: string, { req }: Meta) => {
  const emailLower = email.toLowerCase();
  const client = await ClientModel.findOne({ email: emailLower });

  if (client && client._id.toString() !== req.params?.id) {
    throw new Error(`El correo: ${email} ya está registrado por otro cliente.`);
  }
};

export const ClientIdExist = async (id: String) => {
  // Verificar si el id es válido respcto al validObjetId
  if (!isValidObjectId(id)) {
    throw new Error(`El id: ${id}, no es un ObjectId válido.`);
  }
  // Verificar si el ID existe
  const userId = await ClientModel.findById(id);
  if (!userId) {
    throw new Error(`El id: ${id}, no existe en la BD`);
  }
};
