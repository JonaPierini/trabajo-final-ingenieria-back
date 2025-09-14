import { Router } from "express";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate";
import { BudgetController } from "../../controllers/budget/budgetController";
import { validateJWT } from "../../../middlewares/validate-token";
import { validateRole } from "../../../middlewares/validate-role";

export const BudgetRoute = () => {
  const router = Router();

  //Instanciamos el controlador de User
  const budgetController = new BudgetController();

  //GET ALL USER
  router.get("/allBudget", budgetController.AllBudget);

  //CREATE BUDGET
  router.post(
    "/newBudget",
    [
      validateJWT, //validamos que tenga token
      validateRole, //validamos que sea admin role
      //  check("user", "El id del usuario es obligatorio").not().isEmpty(),
      check("client", "El id del cliente es obligatorio").not().isEmpty(),
      check("product", "El id del producto es obligatorio").not().isEmpty(),
      validate,
    ],
    budgetController.NewBudget
  );

  //BORRAR un presupuesto por id - Todos los usuarios
  router.delete(
    "/deleteBudget/:id",
    [validateJWT, check("id", "No es un ID válido").isMongoId(), validate],
    budgetController.DeleteBudget
  );

  return router;
};
