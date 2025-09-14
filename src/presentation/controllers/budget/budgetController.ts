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

  //GET BUDGET BY ID - populate
  public BudgetById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const budgetById = await BudgetModel.findById(id)
      .populate("user")
      .populate("client")
      .populate({
        path: "product.productId", // Popular los detalles de cada producto
        model: "Product", // Modelo de producto referenciado
      });
    res.json({
      msg: "Presupuesto encontrada: ",
      budgetById,
    });
  };

  //CREATE NEW BUDGET
  public NewBudget = async (req: Request, res: Response) => {
    try {
      const { client, product } = req.body;

      const userId = (req as any).usuario?._id;

      // VALIDAR CLIENTE
      if (!mongoose.Types.ObjectId.isValid(client)) {
        return res.status(400).json({ msg: "El clientId no es válido" });
      }

      const clientDb = await ClientModel.findById(client);
      if (!clientDb) {
        return res.status(400).json({ msg: "El cliente no existe" });
      }

      // Verificar si el cliente esta activo
      if (!clientDb.state) {
        return res.status(400).json({
          msg: `El cliente con ID ${req.body.client} está inactivo`,
        });
      }

      //VALIDAR PRODUCTO

      // Validar producto duplicados
      const productIds = product.map((p: any) => p.productId);
      const uniqueIds = new Set(productIds);

      if (uniqueIds.size !== productIds.length) {
        return res.status(400).json({
          msg: "No se permiten productos repetidos en el presupuesto",
        });
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

        // Verificar si el producto esta activo
        if (!productDb?.state) {
          return res.status(400).json({
            msg: `El producto con ID ${p.productId} está inactivo`,
          });
        }

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
          state: req.body.state ?? true,
        });
      }

      // Calcular el total
      const total = fullProducts.reduce(
        (acc, p) => acc + p.quantity * p.price,
        0
      );

      // Crear el presupuesto
      //      const userId = (req as any).body.user._id;
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

  //DELETE PRODUCT - state: false

  public DeleteBudget = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const budget = await BudgetModel.findByIdAndUpdate(
        id,
        { state: false },
        { new: true }
      );

      if (!budget) {
        return res.status(404).json({
          msg: "Presupuesto no encontrado",
        });
      }

      res.status(200).json({
        msg: "Cambio de estado = estado(false)",
        budget,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        msg: "Error al eliminar el presupuest",
        error,
      });
    }
  };

  //ACTUALIZAR PRESUPUEST
  public PutBudget = async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // id del presupuesto
      const { client, productId, quantity } = req.body;

      // --- Helpers ---
      const toNum = (v: any) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      // --- 1) Validar ID del presupuesto ---
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "El budgetId no es válido" });
      }

      // --- 2) Buscar presupuesto ---
      const budget = await BudgetModel.findById(id);
      if (!budget) {
        return res.status(404).json({ msg: "El presupuesto no existe" });
      }

      // --- 3) Early return si no hay nada que actualizar ---
      const nothingToUpdate =
        client === undefined &&
        productId === undefined &&
        quantity === undefined;
      if (nothingToUpdate) {
        return res.status(200).json({ msg: "Sin cambios", budget });
      }

      // --- 4) Si viene cliente -> validarlo y actualizarlo ---
      if (client !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(client)) {
          return res.status(400).json({ msg: "El clientId no es válido" });
        }
        const clientDb = await ClientModel.findById(client);
        if (!clientDb) {
          return res.status(400).json({ msg: "El cliente no existe" });
        }
        if (!clientDb.state) {
          return res.status(400).json({ msg: "El cliente está inactivo" });
        }
        budget.client = clientDb._id;
      }

      // --- 5) Si viene producto/cantidad -> validar y actualizar/agregar ---
      let touchedProduct = false;

      if (productId !== undefined || quantity !== undefined) {
        // Ambos son requeridos para tocar producto
        if (productId === undefined) {
          return res.status(400).json({ msg: "Falta productId" });
        }
        if (quantity === undefined) {
          return res.status(400).json({ msg: "Falta quantity" });
        }

        touchedProduct = true;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({ msg: "El productId no es válido" });
        }

        const q = Number(quantity);
        if (!Number.isFinite(q) || q <= 0) {
          return res
            .status(400)
            .json({ msg: "La cantidad debe ser un número > 0" });
        }

        const productDb = await ProductoModel.findById(productId);
        if (!productDb) {
          return res.status(400).json({ msg: "El producto no existe" });
        }
        if (!productDb.state) {
          return res.status(400).json({ msg: "El producto está inactivo" });
        }

        // Buscar si el producto ya existe en el presupuesto
        const existing = (budget.product as any[]).find(
          (p) => p.productId.toString() === String(productId)
        );

        if (existing) {
          // Actualizar cantidad
          existing.quantity = q;
          // Asegurar price válido (por si el dato viejo no lo tenía)
          if (!Number.isFinite(Number(existing.price))) {
            existing.price = toNum(productDb.value);
          }
        } else {
          // Agregar producto nuevo
          (budget.product as any[]).push({
            productId: productDb._id,
            quantity: q,
            name: productDb.name,
            price: toNum(productDb.value),
            state: true,
          });
        }
      }

      // --- 6) Recalcular total SOLO si se tocó el producto ---
      if (touchedProduct) {
        for (const item of budget.product as any[]) {
          item.quantity = toNum(item.quantity);

          // Hidratar price desde BD si falta o no es numérico
          if (!Number.isFinite(Number(item.price))) {
            const prod = await ProductoModel.findById(item.productId).select(
              "value"
            );
            item.price = toNum(prod?.value);
          }
        }

        const sum = (budget.product as any[]).reduce(
          (acc, p) => acc + toNum(p.quantity) * toNum(p.price),
          0
        );

        budget.total = Number.isFinite(sum) ? sum : 0; // nunca NaN
      }

      // --- 7) Guardar y responder ---

      await budget.save();

      // volver a buscar el presupuesto actualizado y poblar relaciones
      const populatedBudget = await BudgetModel.findById(budget._id)
        .populate("user")
        .populate("client")
        .populate("product.productId"); // 👈 este es el correcto

      return res.status(200).json({
        msg: "Presupuesto actualizado correctamente",
        budget: populatedBudget,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ msg: "Error al actualizar el presupuesto" });
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
