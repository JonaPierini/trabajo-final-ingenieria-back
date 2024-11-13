import { Request, Response } from "express";
import { CategoryModel } from "../../models/category.model";

export class CategoryController {
  constructor() {}

  //GET ALL CATEGORY - Paginado - total - populate (quien grabo)
  public AllCategory = async (req: Request, res: Response) => {
    const { limite = 3, desde = 0 } = req.query;
    //Me va a traer aquellas categorias que tengan el estado en true
    const query = { state: true };
    const [total, categoria] = await Promise.all([
      CategoryModel.countDocuments(query),
      CategoryModel.find(query)
        //Funcion de moongoose que te trae, en este caso, el usuario que grabo la categoria
        //POPULATE => Pero ese valor 'user' es en base a como lo creaste la cateria en la bd
        .populate("user", "name")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);
    res.json({
      msg: "AllCategory",
      total,
      categoria,
    });
  };

  //GET CATEGORY BY ID - populate
  public CategoryById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const categoyById = await CategoryModel.findById(id).populate(
      "user",
      "name"
    );
    res.json({
      msg: "Categoria encontrada: ",
      categoyById,
    });
  };

  //CRATE CATEGORY
  public CreateCategory = async (req: Request, res: Response) => {
    //Crear categoria - privado - con token valido

    const name = req.body.name.toUpperCase();

    const categoryDB = await CategoryModel.findOne({ name });

    if (categoryDB) {
      return res.status(400).json({
        msg: `La categoria ${name} ya existe`,
      });
    }

    //Generar la data en db
    const newCategory = await CategoryModel.create({
      name: req.body.name.toUpperCase(),
      state: req.body.state,
      user: req.body.user._id,
    });

    //Guarda en bd que no haria falta pq ya arriba se esta creando
    await newCategory.save();

    res.status(200).json({
      msg: "Categoria Creada",
      newCategory,
    });
  };

  //UPDATE CATEGORY BY ID
  public PutCategory = async (req: Request, res: Response) => {
    const id = req.params.id;

    //Actualizo el name
    const upDateCategory = {
      name: req.body.name.toUpperCase(),
    };

    // Actualizar la categoria y devolver el documento actualizado
    const category = await CategoryModel.findByIdAndUpdate(id, upDateCategory, {
      new: true,
    });

    res.status(200).json(category);
  };

  //DELETE CATEGORY - state: false
  public DeleteCategory = async (req: Request, res: Response) => {
    const id = req.params.id;
    const category = await CategoryModel.findByIdAndUpdate(
      id,
      { state: false },
      //con el new devuelvo el valor de la categoria actualizado
      { new: true }
    );
    res.status(200).json({
      msg: "Cambio de estado = estado(false)",
      category,
    });
  };
}
