import { Request, Response } from "express";
import { ProductoModel } from "../../models/product.model";
import { CategoryModel } from "../../models/category.model";

export class ProductController {
  constructor() {}

  //GET ALL PRODUCT - Paginado - total - populate (quien grabo)
  public AllProduct = async (req: Request, res: Response) => {
    const { limite = 3, desde = 0 } = req.query;
    //Me va a traer aquellas categorias que tengan el estado en true
    const query = { state: true };
    const [total, producto] = await Promise.all([
      ProductoModel.countDocuments(query),
      ProductoModel.find(query)
        //Funcion de moongoose que te trae, en este caso, el usuario que grabo la categoria
        //POPULATE => Pero ese valor 'user' es en base a como lo creaste la cateria en la bd
        .populate("user", "name")
        .populate("category", "name")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);
    res.json({
      msg: "AllProduct",
      total,
      producto,
    });
  };

  //GET PRODUCTO BY ID - populate
  public ProductById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const ProductById = await ProductoModel.findById(id)
      .populate("user", "name")
      .populate("category", "name");
    res.json({
      msg: "Producto encontrado: ",
      ProductById,
    });
  };

  //CREAR PRODUCTO
  public CreateProduct = async (req: Request, res: Response) => {
    //Crear producto - privado - con token valido

    const name = req.body.name.toUpperCase().trim();

    const productDB = await ProductoModel.findOne({ name });

    if (productDB) {
      return res.status(400).json({
        msg: `El producto ${name} ya existe`,
      });
    }

    //Generar la data en db le que le pasamos es en el body la category: y el valor es el id de esa categoria
    const newProducto = await ProductoModel.create({
      name: req.body.name.toUpperCase().trim(),
      state: req.body.state,
      value: req.body.value,
      stock: req.body.stock,
      description: req.body.description,
      user: req.body.user._id,
      category: req.body.category,
    });

    //Guarda en bd que no haria falta pq ya arriba se esta creando
    await newProducto.save();

    res.status(200).json({
      msg: "Producto Creado",
      newProducto,
    });
  };

  //UPDATE PRODUCTO BY ID
  public PutProduct = async (req: Request, res: Response) => {
    const id = req.params.id;

    //Actualizo el name, el value, (precio) el stock
    const upDateProduct = {
      name: req.body.name.toUpperCase().trim(),
      value: req.body.value,
      stock: req.body.stock,
    };

    // Actualizar el producto y devolver el documento actualizado
    const product = await ProductoModel.findByIdAndUpdate(id, upDateProduct, {
      new: true,
    });

    res.status(200).json(product);
  };

  //DELETE PRODUCT - state: false
  public DeleteProduct = async (req: Request, res: Response) => {
    const id = req.params.id;
    const product = await ProductoModel.findByIdAndUpdate(
      id,
      { state: false },
      //con el new devuelvo el valor del producto actualizado
      { new: true }
    );
    res.status(200).json({
      msg: "Cambio de estado = estado(false)",
      product,
    });
  };
}
