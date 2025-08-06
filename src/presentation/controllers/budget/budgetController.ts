import { Request, Response } from "express";
import { BudgetModel } from "../../models/budget.model";
import { UserModel } from "../../models/user.model";
import { ClientModel } from "../../models/client.model";
import { ProductoModel } from "../../models/product.model";
import mongoose from "mongoose";

export class BudgetController {
  constructor() {}

  //GET All Budget
  public AllBudget = async (req: Request, res: Response) => {
    const allBudget = await BudgetModel.find()
      .populate("user")
      .populate("client")
      .populate({
        path: "product.productId", // Popular los detalles de cada producto
        model: "Product", // Modelo de producto referenciado
      });
    res.json({
      msg: "Todos los presupuestos en la BD",
      allBudget,
    });
  };

  //CREATE NEW BUDGET
  public NewBudget = async (req: Request, res: Response) => {
    try {
      const { client, product } = req.body;

      // Validar clientId
      if (!mongoose.Types.ObjectId.isValid(client)) {
        return res.status(400).json({ msg: "El clientId no es válido" });
      }

      const clientDb = await ClientModel.findById(client);
      if (!clientDb) {
        return res.status(400).json({ msg: "El cliente no existe" });
      }

      // Validar productos y armar lista completa
      const fullProducts = [];

      for (const p of product) {
        if (!mongoose.Types.ObjectId.isValid(p.productId)) {
          return res
            .status(400)
            .json({ msg: `El productId ${p.productId} no es válido` });
        }

        const productDb = await ProductoModel.findById(p.productId);
        if (!productDb) {
          return res
            .status(400)
            .json({ msg: `El producto con ID ${p.productId} no existe` });
        }

        fullProducts.push({
          productId: productDb._id,
          quantity: p.quantity,
          name: productDb.name,
          price: productDb.value,
        });
      }

      // Calcular el total
      const total = fullProducts.reduce(
        (acc, p) => acc + p.quantity * p.price,
        0
      );

      // Crear el presupuesto
      const userId = (req as any).body.user._id;
      const newBudget = await BudgetModel.create({
        user: userId, // del token
        client,
        product: fullProducts,
        total,
      });

      res.status(201).json({
        msg: "Presupuesto creado correctamente",
        newBudget,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Error al crear el presupuesto" });
    }
  };
}

// {
//   "_id": "ID_DEL_PRESUPUESTO",
//   "product": [
//     {
//       "_id": "ID_DEL_SUBDOCUMENTO",         // 🔹 ID del producto dentro del presupuesto
//       "productId": "ID_DEL_PRODUCTO_REAL",  // 🔸 Referencia al producto global
//       "quantity": 5,
//       "name": "PRODUCTO 1",
//       "price": 100
//     }
//   ]
// }
