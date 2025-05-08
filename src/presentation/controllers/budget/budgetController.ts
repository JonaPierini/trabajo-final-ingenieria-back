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
    const { user, client, product } = req.body;
    // Validación y conversión del userId => como yo se que el usuario existe, pq es quien va a crear el presupuesto (y ademas es quien ya se valido al ingresar al sistema) no hago nada respecto a find en su modelo (UserModel)
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        msg: "El userId no es válido",
      });
    }

    // Validación y conversión del clientId
    if (!mongoose.Types.ObjectId.isValid(client)) {
      return res.status(400).json({
        msg: "El clientId no es válido",
      });
    }

    const clientDb = await ClientModel.findById(client);
    if (!clientDb) {
      return res.status(400).json({
        msg: "El cliente no existe",
      });
    }

    // Validar cada productId
    for (const p of product) {
      if (!mongoose.Types.ObjectId.isValid(p.productId)) {
        return res.status(400).json({
          msg: `El productId ${p.productId} no es válido`,
        });
      }

      const productDb = await ProductoModel.findById(p.productId);
      if (!productDb) {
        return res.status(400).json({
          msg: `El producto con ID ${p.productId} no existe`,
        });
      }
    }

    // Obtener los productos de la base de datos
    const productIds = product.map((p: any) => p.productId);
    const productsFromDb = await ProductoModel.find({
      _id: { $in: productIds },
    });
    // Calcular el total
    let total = 0;
    product.forEach((p: any) => {
      const productData = productsFromDb.find(
        (dbProduct) => dbProduct._id.toString() === p.productId
      );
      if (productData) {
        total += productData.value * p.quantity;
      }
    });

    const NewBudget = await BudgetModel.create({
      user: req.body.user,
      client: req.body.client,
      product: req.body.product,
      total: total,
    });

    //Guarda en bd
    await NewBudget.save();

    //Lo que muestro en postman
    res.status(200).json({
      msg: "Nuevos presupuesto creado",
      NewBudget,
    });
  };
}
