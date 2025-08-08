import { Router } from "express";
import { CategoryController } from "../../controllers/category/categoryController";
import { validate } from "../../../middlewares/validate";
import { validateJWT } from "../../../middlewares/validate-token";
import { check } from "express-validator";
import { CategoryIdExist } from "../../../helpers/db-validators";
import { validateRole } from "../../../middlewares/validate-role";

export const CategoryRoute = () => {
  const router = Router();

  //INSTANCIANMOS el controlador de la CATEGORIA
  const categroyControler = new CategoryController();

  //OBTENER todas las categorias - publico
  router.get("/allCategory", [validate], categroyControler.AllCategory);

  //OBTENER una categoria por id - publico
  router.get(
    "/categoryById/:id",
    [
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(CategoryIdExist),
      validate,
    ],
    categroyControler.CategoryById
  );

  //CREAR CATEGORIA - privado - con token valido (con valideteJWT)
  router.post(
    "/createCategory",
    [
      validateJWT,
      validateRole,
      check("name", "El nombre es obligatorio").not().isEmpty(),
      check("state", "El estado es obligatorio").not().isEmpty(),
      validate,
    ],
    categroyControler.CreateCategory
  );

  //ACTUALIZAR categoria por id - privado - con token valido
  router.put(
    "/putCategory/:id",
    [
      validateJWT,
      validateRole,
      check("_id", "El id no se puede cambiar").isEmpty(),
      check("id").custom(CategoryIdExist),
      check("name", "El nombre no puede estar vacio").not().isEmpty(),
      validate,
    ],
    categroyControler.PutCategory
  );

  //BORRAR un categoria por id - Admin
  router.delete(
    "/deleteCategory/:id",
    [
      validateJWT,
      validateRole,
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(CategoryIdExist),
      validate,
    ],
    categroyControler.DeleteCategory
  );

  return router;
};
