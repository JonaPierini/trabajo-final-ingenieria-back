import { Router } from "express";
import { UserRoute } from "./UsersRoutes/UsersRoutes";
import { AuthRoute } from "./AuthRoutes/AuthRoutes";
import { CategoryRoute } from "./CategoryRoutes/CategoryRoutes";
import { ProductRoute } from "./ProductRoutes/ProductRoutes";
import { SearchRoute } from "./SearchRoutes/SearchRoutes";
import { ClientRoute } from "./ClientRoutes/ClientRoutes";

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
    router.use("/api", SearchRoute());

    //CLIENT
    router.use("/api", ClientRoute());

    return router;
  }
}
