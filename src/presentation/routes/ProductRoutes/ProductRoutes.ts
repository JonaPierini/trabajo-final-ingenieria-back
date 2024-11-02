import { Router } from "express";
import { validate } from "../../../middlewares/validate";
import { ProductController } from "../../controllers/product/productController";
import { validateJWT } from "../../../middlewares/validate-token";
import { check } from "express-validator";
import { ProductIdExist } from "../../../helpers/db-validators";
import { validateRole } from "../../../middlewares/validate-role";

export const ProductRoute = () => {
  const router = Router();

  //INSTANCIANMOS el controlador del PRODUCTO
  const productController = new ProductController();

  //OBTENER todos los productos - publico
  router.get("/allProduct", [validate], productController.AllProduct);

  //OBTENER un producto por id - publico
  router.get(
    "/productById/:id",
    [
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(ProductIdExist),
      validate,
    ],
    productController.ProductById
  );

  //CREAR producto - privado - con token valido (con valideteJWT)
  router.post(
    "/createProduct",
    [
      validateJWT,
      check("name", "El nombre es obligatorio").not().isEmpty(),
      check("state", "El estado es obligatorio").not().isEmpty(),
      check("value", "El precio es obligatorio").not().isEmpty(),
      check("stock", "El stock es obligatorio").not().isEmpty(),
      check("description", "La descripción es obligatorio").not().isEmpty(),
      check("category", "La categoria es es obligatorio").not().isEmpty(),
      validate,
    ],
    productController.CreateProduct
  );

  //ACTUALIZAR producto por id - privado - con token valido
  router.put(
    "/putProduct/:id",
    [
      validateJWT,
      check("_id", "El id no se puede cambiar").isEmpty(),
      check("id").custom(ProductIdExist),
      check("state", "El estado no se puede cambiar").isEmpty(),
      check("name", "El nombre no puede estar vacio").not().isEmpty(),
      validate,
    ],
    productController.PutProduct
  );

  //BORRAR un categoria por id - Admin
  router.delete(
    "/deleteProduct/:id",
    [
      validateJWT,
      validateRole,
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(ProductIdExist),
      validate,
    ],
    productController.DeleteProduct
  );

  return router;
};
