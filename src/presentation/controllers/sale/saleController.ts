import { Request, Response } from "express";
import { SaleModel } from "../../models/sale.model";
import mongoose from "mongoose";
import { ClientModel } from "../../models/client.model";
import { ProductoModel } from "../../models/product.model";

export class SaleController {
  constructor() {}

  //1. GET All Sale
  public AllSale = async (req: Request, res: Response) => {
    const allSale = await SaleModel.find()
      .populate("user")
      .populate("client")
      .populate({
        path: "product.productId", // Popular los detalles de cada producto
        model: "Product", // Modelo de producto referenciado
      });
    res.json({
      msg: "Todos las ventas",
      allSale,
    });
  };

  //2. GET SALE BY ID - populate
  public SaleById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const budgetById = await SaleModel.findById(id)
      .populate("user")
      .populate("client")
      .populate({
        path: "product.productId", // Popular los detalles de cada producto
        model: "Product", // Modelo de producto referenciado
      });
    res.json({
      msg: "Venta encontrada: ",
      budgetById,
    });
  };

  //3. CREATE NEW SALE
  public NewSale = async (req: Request, res: Response) => {
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
          msg: "No se permiten productos repetidos en las ventas",
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

        // 👇 NUEVO: validar stock suficiente
        if (typeof p.quantity !== "number" || p.quantity <= 0) {
          return res
            .status(400)
            .json({ msg: `Cantidad inválida para ${productDb.name}` });
        }
        if (productDb.stock < p.quantity) {
          return res.status(400).json({
            msg: `Stock insuficiente para ${productDb.name} (stock: ${productDb.stock}, pedido: ${p.quantity})`,
          });
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

      // Descontar stock de forma segura antes de crear la venta
      // Usamos filtro con stock >= quantity para evitar vender stock negativo si hubo concurrencia
      const bulkOps = fullProducts.map((item) => ({
        updateOne: {
          filter: { _id: item.productId, stock: { $gte: item.quantity } },
          update: { $inc: { stock: -item.quantity } },
        },
      }));

      const bulkRes = await ProductoModel.bulkWrite(bulkOps);

      // Verificamos que se haya podido descontar de todos los productos
      const modifiedCount = bulkRes.modifiedCount ?? 0;

      if (modifiedCount !== fullProducts.length) {
        return res.status(409).json({
          msg: "No se pudo descontar el stock de todos los productos (concurrencia/stock insuficiente). Inténtalo de nuevo.",
        });
      }

      // Crear la venta
      //      const userId = (req as any).body.user._id;
      const newSale = await SaleModel.create({
        user: userId, // del token
        client,
        product: fullProducts,
        total,
      });

      res.status(201).json({
        msg: "Venta realizada con exito",
        newSale,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Error al crear la venta" });
    }
  };

  //3. DALETE SALE
  public DeleteSale = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      // Buscar la venta
      const sale = await SaleModel.findByIdAndUpdate(
        id,
        { state: false },
        { new: true }
      );

      if (!sale) {
        return res.status(404).json({
          msg: "Venta no encontrada",
        });
      }

      // 🧩 Reponer el stock solo de los productos de ESTA venta
      if (sale.product && sale.product.length > 0) {
        const bulkOps = sale.product.map((item: any) => ({
          updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { stock: item.quantity } }, // devolvemos el stock vendido
          },
        }));

        await ProductoModel.bulkWrite(bulkOps);
      }

      res.status(200).json({
        msg: "Cambio de estado = estado(false)",
        sale,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        msg: "Error al eliminar la venta",
        error,
      });
    }
  };
}
