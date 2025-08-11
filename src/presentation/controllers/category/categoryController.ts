import { Request, Response } from "express";
import { CategoryModel } from "../../models/category.model";

export class CategoryController {
  constructor() {}

  //GET ALL CATEGORY - Paginado - total - populate (quien grabo)
  public AllCategory = async (req: Request, res: Response) => {
    const { limite = 20, desde = 0 } = req.query;
    //Me va a traer aquellas categorias que tengan el estado en true (comentado)
    //const query = { state: true  };
    //Me va a traer todas las categorias (state: true y false)
    const query = {};
    const [total, allCategory] = await Promise.all([
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
      allCategory,
    });
  };

  //GET CATEGORY BY ID - populate
  public CategoryById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const categoryById = await CategoryModel.findById(id).populate(
      "user",
      "name"
    );
    res.json({
      msg: "Categoria encontrada: ",
      categoryById,
    });
  };

  //CRATE CATEGORY
  public CreateCategory = async (req: Request, res: Response) => {
    // Defensa: nunca aceptar user en el body
    if ("user" in req.body) delete req.body.user;

    const name = String(req.body.name || "").toUpperCase();
    const categoryDB = await CategoryModel.findOne({ name });
    if (categoryDB) {
      return res.status(400).json({ msg: `La categoria ${name} ya existe` });
    }

    // Si no viene usuario del middleware → 401
    const userId = (req as any).usuario?._id;
    if (!userId) {
      return res.status(401).json({ msg: "Token faltante o inválido" });
    }

    const newCategory = await CategoryModel.create({
      name,
      state: req.body.state ?? true,
      user: userId, // ← del middleware, no del body
    });

    await newCategory.save();

    res.status(200).json({ msg: "Categoria Creada", newCategory });
  };

  //UPDATE CATEGORY BY ID
  public PutCategory = async (req: Request, res: Response) => {
    const id = req.params.id;

    // Obtenemos los valores enviados en el body
    const { name, state } = req.body;

    // 1. Verificamos que la categoría con ese ID exista
    const categoryToUpdate = await CategoryModel.findById(id);
    if (!categoryToUpdate) {
      return res.status(404).json({ msg: "Categoría no encontrada." });
    }

    // 2. Verificamos si el nombre enviado es diferente al actual
    // 2. Si el nombre cambió, validamos que no exista (sin importar mayúsculas/minúsculas)
    if (name && name.toUpperCase() !== categoryToUpdate.name.toUpperCase()) {
      const categoryExists = await CategoryModel.findOne({
        name: { $regex: `^${name}$`, $options: "i" }, // búsqueda insensible a mayúsculas
      });

      // Si existe y su ID es diferente a la que estoy actualizando, entonces hay un conflicto
      if (categoryExists && categoryExists._id.toString() !== id) {
        return res.status(400).json({
          msg: "Ya existe una categoría con ese nombre.",
        });
      }
    }

    // 3. Construimos el objeto con los valores actualizados
    const upDateCategory = {
      name: name?.toUpperCase() || categoryToUpdate.name, // Usamos el nuevo nombre en mayúsculas, o el anterior si no se envió
      state: state, // Si se envió el estado, lo usamos, si no dejamos el anterior
    };

    // 4. Actualizamos la categoría y devolvemos el nuevo documento
    const category = await CategoryModel.findByIdAndUpdate(id, upDateCategory, {
      new: true, // Para que nos devuelva la categoría ya actualizada
    });

    // 5. Enviamos la categoría actualizada como respuesta
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
