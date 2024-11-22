import { Request, Response } from "express";
import { CategoryModel } from "../../models/category.model";
import { UserModel } from "../../models/user.model";
import { ProductoModel } from "../../models/product.model";
import { isValidObjectId } from "mongoose";

export class SearchController {
  constructor() {}

  //BUSCAR => http://localhost:8000/api/search/produc/6734e5a081b9e11320c880da
  public searchAll = async (req: Request, res: Response) => {
    const colectionExist = ["category", "user", "produc"];
    const { colection, id } = req.params;

    if (!colectionExist.includes(colection.toLowerCase())) {
      return res.status(400).json({
        msg: `Las coleccions permitidas son ${colectionExist}`,
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: `El ${id} no es un id valido`,
      });
    }

    if (colection.toLowerCase() === "user") {
      const searchUser = await UserModel.findById(id);
      if (!searchUser) {
        return res.status(400).json({
          msg: `Usuario ${id} no existe`,
        });
      }
      return res.json({
        msg: "Usuario encontrado",
        data: searchUser,
      });
    }

    if (colection.toLowerCase() === "produc") {
      const searchProduct = await ProductoModel.findById(id);
      if (!searchProduct) {
        return res.status(400).json({
          msg: `Producto ${id} no existe`,
        });
      }
      return res.json({
        msg: "Producto encontrado",
        data: searchProduct,
      });
    }

    if (colection.toLowerCase() === "category") {
      const searchCategory = await CategoryModel.findById(id);
      if (!searchCategory) {
        return res.status(400).json({
          msg: `Categoria ${id} no existe`,
        });
      }
      return res.json({
        msg: "Categoria encontrada",
        data: searchCategory,
      });
    }
  };
}
