import { Request, Response } from "express";
import { ProductoModel } from "../../models/product.model";
import { CategoryModel } from "../../models/category.model";

export class ProductController {
  constructor() {}

  //GET ALL PRODUCT - Paginado - total - populate (quien grabo)
  public AllProduct = async (req: Request, res: Response) => {
    const { limite = 30, desde = 0 } = req.query;
    //Me va a traer aquellas categorias que tengan el estado en true
    const query = {};
    const [total, allProduct] = await Promise.all([
      ProductoModel.countDocuments(query),
      ProductoModel.find(query)
        //Funcion de moongoose que te trae, en este caso, el usuario que grabo la categoria
        //POPULATE => Pero ese valor 'user' es en base a como lo creaste la cateria en la bd
        .populate("user", "_id name")
        .populate("category", "_id name")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);
    res.json({
      msg: "AllProduct",
      total,
      allProduct,
    });
  };

  //GET PRODUCTO BY ID - populate
  public ProductById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const productById = await ProductoModel.findById(id)
      .populate("user", "_id name")
      .populate("category", "_id name");
    res.json({
      msg: "Producto encontrado: ",
      productById,
    });
  };

  //CREAR PRODUCTO
  public CreateProduct = async (req: Request, res: Response) => {
    //Crear producto - privado - con token valido

    const name = req.body.name.toUpperCase().trim(); //nombre producto

    //Verificar si el producto existe
    const productDB = await ProductoModel.findOne({ name });
    if (productDB) {
      return res.status(400).json({
        msg: `El producto ${name} ya existe`,
      });
    }

    // Verificar si la categoría existe
    const categoryExists = await CategoryModel.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({
        msg: `La categoría con ID ${req.body.category} no existe`,
      });
    }

    // Verificar si la categoría esta activa
    if (!categoryExists.state) {
      return res.status(400).json({
        msg: `La categoría con ID ${req.body.category} está inactiva`,
      });
    }

    // Si no viene usuario del middleware → 401
    const userId = (req as any).usuario?._id;
    if (!userId) {
      return res.status(401).json({ msg: "Token faltante o inválido" });
    }

    //Generar la data en db le que le pasamos es en el body la category: y el valor es el id de esa categoria
    const newProducto = await ProductoModel.create({
      name: name,
      state: req.body.state ?? true,
      value: req.body.value,
      stock: req.body.stock,
      description: req.body.description,
      category: req.body.category,
      user: userId, // ← del middleware, no del body
    });

    //Guarda en bd que no haria falta pq ya arriba se esta creando
    await newProducto.save();

    res.status(200).json({
      msg: "Producto Creado",
      newProducto,
    });
  };

  //UPDATE PRODUCTO BY ID
  // UPDATE PRODUCTO BY ID (solo correcciones necesarias)
  public PutProduct = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      // Verificar que exista el producto a actualizar
      const productToUpdate = await ProductoModel.findById(id);
      if (!productToUpdate) {
        return res.status(404).json({ msg: "Producto no encontrado." });
      }

      // Si no viene usuario del middleware → 401
      const userId = (req as any).usuario?._id;
      if (!userId) {
        return res.status(401).json({ msg: "Token faltante o inválido" });
      }

      const updates: any = { user: userId };

      // --- Nombre (opcional): normalizar + validar duplicado excluyendo el propio ID
      if (typeof req.body.name === "string") {
        const rawName = req.body.name.trim();
        if (!rawName) {
          return res.status(400).json({ msg: "El nombre no puede ser vacío." });
        }
        const normalizedName = rawName.toUpperCase();

        if (normalizedName !== productToUpdate.name.toUpperCase()) {
          const duplicate = await ProductoModel.findOne({
            name: { $regex: `^${normalizedName}$`, $options: "i" },
            _id: { $ne: id }, // ← excluye el producto actual
          });
          if (duplicate) {
            return res
              .status(400)
              .json({ msg: "Ya existe un producto con ese nombre." });
          }
        }

        updates.name = normalizedName;
      }

      // --- Categoría (opcional): validar existencia y estado
      if (req.body.category) {
        const category = await CategoryModel.findById(req.body.category);
        if (!category) {
          return res.status(400).json({
            msg: `La categoría con ID ${req.body.category} no existe`,
          });
        }
        if (!category.state) {
          return res.status(400).json({
            msg: `La categoría con ID ${req.body.category} está inactiva`,
          });
        }
        updates.category = req.body.category;
      }

      // --- Otros campos (opcionales)
      if (req.body.value !== undefined) updates.value = req.body.value;
      if (req.body.stock !== undefined) updates.stock = req.body.stock;
      if (req.body.description !== undefined)
        updates.description = req.body.description;
      if (req.body.state !== undefined) updates.state = req.body.state;

      // Actualizar y devolver el documento actualizado
      const updated = await ProductoModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      return res.status(200).json(updated);
    } catch (err: any) {
      // Si tenés índice único en name, capturá E11000
      if (err?.code === 11000) {
        return res
          .status(400)
          .json({ msg: "Ya existe un producto con ese nombre." });
      }
      console.error(err);
      return res
        .status(500)
        .json({ msg: "Error inesperado al actualizar producto" });
    }
  };

  //DELETE PRODUCT - state: false

  public DeleteProduct = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const product = await ProductoModel.findByIdAndUpdate(
        id,
        { state: false },
        { new: true }
      )
        .populate("user", "_id name") // traigo id y name
        .populate("category", "_id name"); // itraigo id y name

      if (!product) {
        return res.status(404).json({
          msg: "Producto no encontrado",
        });
      }

      res.status(200).json({
        msg: "Cambio de estado = estado(false)",
        product,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        msg: "Error al eliminar el producto",
        error,
      });
    }
  };
}
