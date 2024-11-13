import { Router } from "express";
import { validate } from "../../../middlewares/validate";
import { SearchController } from "../../controllers/search/searchController";

export const SearchRoute = () => {
  const router = Router();

  //INSTANCIANMOS el controlador de la busqueda
  const searchControler = new SearchController();
  router.get("/:colection/:id", [validate], searchControler.searchAll);

  return router;
};
