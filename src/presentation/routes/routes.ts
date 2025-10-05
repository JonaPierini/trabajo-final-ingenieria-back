import { Router } from "express";
import { UserRoute } from "./UsersRoutes/UserRoutes";
import { AuthRoute } from "./AuthRoutes/AuthRoutes";
import { CategoryRoute } from "./CategoryRoutes/CategoryRoutes";
import { ProductRoute } from "./ProductRoutes/ProductRoutes";
import { SearchRoute } from "./SearchRoutes/SearchRoutes";
import { ClientRoute } from "./ClientRoutes/ClientRoutes";
import { BudgetRoute } from "./BudgetRoutes/BudgetRoutes";
import { SaleRoute } from "./SaleRoutes/SaleRoutes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    //AUTH-LOGIN
    router.use("/api", AuthRoute());

    //USERS
    router.use("/api", UserRoute());

    //CATEGORY
    router.use("/api", CategoryRoute());

    //PRODUCT
    router.use("/api", ProductRoute());

    //SEARCH
    router.use("/api/search", SearchRoute());

    //CLIENT
    router.use("/api", ClientRoute());

    //BUDGET
    router.use("/api", BudgetRoute());

    //SALE
    router.use("/api", SaleRoute());

    return router;
  }
}
