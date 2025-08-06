import { Router } from "express";
import { ClientController } from "../../controllers/client/clientController";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate";
import {
  ClientEmailExist,
  ClientIdExist,
} from "../../../helpers/db-validators";

export const ClientRoute = () => {
  const router = Router();

  //Instanciamos el controlador de Client
  const clientController = new ClientController();

  //GET ALL Client
  router.get("/allClient", clientController.AllClient);

  //GET BY ID
  router.get(
    "/clientById/:id",
    [
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(ClientIdExist),
      validate,
    ],
    clientController.ClientById
  );

  //CREATE CLIENT
  router.post(
    "/newClient",
    [
      check("name", "El nombre es obligatorio").not().isEmpty(),
      check("email", "El email no puede estar vacio").not().isEmpty(),
      check("address", "La direccion no puede estar vacio").not().isEmpty(),
      check("location", "La Localidad no puede estar vacio").not().isEmpty(),
      check("provinces", "La Provincia no puede estar vacio").not().isEmpty(),
      check("email", "Tiene que ser un correo válido").isEmail(),
      //Este check tiene el custon que le pasa la funcion de EmailExist que verifica si el email ya existe guardado en la BD
      check("email").custom(ClientEmailExist),
      //Validate es una funcion que permite manejar los errores
      validate,
    ],
    clientController.NewClient
  );

  //UPDATE CLIENT
  //Actualizo el  name , address, location, provinces
  router.put(
    "/putClient/:id",
    [
      check("name", "El nombre no puede estar vacio").not().isEmpty(),
      check("address", "La direccion no puede estar vacia").not().isEmpty(),
      check("location", "La localidad no puede estar vacia").not().isEmpty(),
      check("provinces", "La provincia no puede estar vacia").not().isEmpty(),
      check("id", "No es un ID válido").isMongoId(),
      check("email").custom(ClientEmailExist),
      check("id").custom(ClientIdExist),
      validate,
    ],
    clientController.PutClient
  );

  //DELETE USER = state
  router.delete(
    "/deleteClient/:id",
    [check("id").custom(ClientIdExist), validate],
    clientController.DeleteClient
  );

  //DELETE CLIENT BD
  router.delete(
    "/deleteClientDB/:id",
    [
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(ClientIdExist),
      validate,
    ],
    clientController.DeleteClientDB
  );

  return router;
};
