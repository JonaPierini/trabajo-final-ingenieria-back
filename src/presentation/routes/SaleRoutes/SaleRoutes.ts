import { Router } from "express";
import { SaleController } from "../../controllers/sale/saleController";
import { validateJWT } from "../../../middlewares/validate-token";
import { validateRole } from "../../../middlewares/validate-role";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate";
import { SaleIdExist } from "../../../helpers/db-validators";

export const SaleRoute = () => {
  const router = Router();

  //Instanciamos el controlador de User
  const saleController = new SaleController();

  //1. GET ALL SALE
  router.get("/allSale", saleController.AllSale);

  //2. OBTENER una venta por id - publico
  router.get(
    "/saleById/:id",
    [
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(SaleIdExist),
      validate,
    ],
    saleController.SaleById
  );

  //3. CREATE BUDGET
  router.post(
    "/newSale",
    [
      validateJWT, //validamos que tenga token
      validateRole, //validamos que sea admin role
      //  check("user", "El id del usuario es obligatorio").not().isEmpty(),
      check("client", "El id del cliente es obligatorio").not().isEmpty(),
      check("product", "El id del producto es obligatorio").not().isEmpty(),
      validate,
    ],
    saleController.NewSale
  );

  //4. BORRAR una venta por id - Todos los usuarios
  router.delete(
    "/deleteSale/:id",
    [validateJWT, check("id", "No es un ID válido").isMongoId(), validate],
    saleController.DeleteSale
  );

  return router;
};
