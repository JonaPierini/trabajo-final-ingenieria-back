import { Router } from "express";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate";
import { BudgetController } from "../../controllers/budget/budgetController";

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
      check("user", "El id del usuario es obligatorio").not().isEmpty(),
      check("client", "El id del cliente es obligatorio").not().isEmpty(),
      check("product", "El id del producto es obligatorio").not().isEmpty(),
      validate,
    ],
    budgetController.NewBudget
  );

  return router;
};
