import { Router } from "express";
import { UserController } from "../../controllers/users/userController";
import { check } from "express-validator";
import { UserEmailExist, UserIdExist } from "../../../helpers/db-validators";
import { validate } from "../../../middlewares/validate";
import { validateRole } from "../../../middlewares/validate-role";
import { validateJWT } from "../../../middlewares/validate-token";
import { validateDiferenteId } from "../../../middlewares/validate-diferenteId";

export const UserRoute = () => {
  const router = Router();

  //Instanciamos el controlador de User
  const userController = new UserController();

  //GET ALL USER
  router.get("/allUsers", userController.AllUsers);

  //GET BY ID
  router.get(
    "/userById/:id",
    [
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(UserIdExist),
      validate,
    ],
    userController.UserById
  );

  //GET USER BY LIMIT
  router.get("/pagination", userController.PaginationUser);

  //CREATE USER
  //ESE CHECK HACE LAS VALIDACIONES CONFORME ESTAN EN EL MODELO y CONFORME LO MANDO EN EL BODY. Por ejemplo si en el modelo usa name, en el check no puedo usar nombre
  router.post(
    "/newUser",
    [
      validateJWT, // Verifica que el token sea válido
      validateRole, // Verifica que el usuario autenticado sea ADMIN_ROLE
      check("name", "El nombre es obligatorio").not().isEmpty(),
      check("email", "El email no puede estar vacio").not().isEmpty(),
      check("password", "El password no puede estar vacio").not().isEmpty(),
      check(
        "password",
        "El password tiene que tener minimo 8 caracteres"
      ).isLength({ min: 8 }),
      check("email", "Tiene que ser un correo válido").isEmail(),
      check("rol", "Rol tiene que existir").not().isEmpty(),
      check("rol", "No es un rol válido").isIn(["ADMIN_ROLE", "USER_ROLE"]),
      //Este check tiene el custon que le pasa la funcion de EmailExist que verifica si el email ya existe guardado en la BD
      check("email").custom(UserEmailExist),
      //Validate es una funcion que permite manejar los errores
      validate,
    ],
    userController.NewUser
  );

  //UPDATE USER
  router.put(
    "/putUser/:id",
    [
      validateJWT, // Verifica que el token sea válido
      validateRole, // Verifica que el usuario autenticado sea ADMIN_ROLE
      //      check("name", "El nombre no se puede cambiar").isEmpty(),
      check("email", "El email no se puede cambiar").isEmpty(),
      check("state", "El estado no puede estar vacio").not().isEmpty(),
      //      check(
      //        "password",
      //        "El password no puede estar vacio y tiene que tener minimo 8 caracteres"
      //      )
      //        .not()
      //        .isEmpty()
      //        .isLength({ min: 8 }),
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(UserIdExist),
      //      check("rol", "No es un rol válido").isIn(["ADMIN_ROLE", "USER_ROLE"]),
      validate,
    ],
    userController.PutUser
  );

  //DELETE USER
  router.delete(
    "/deleteUser/:id",
    [
      validateJWT,
      validateRole,
      validateDiferenteId,
      check("id").custom(UserIdExist),
      validate,
    ],
    userController.DeleteUser
  );

  //DELETE USER BD
  router.delete(
    "/deleteUserDB/:id",
    [
      validateJWT,
      validateRole,
      validateDiferenteId,
      check("id", "No es un ID válido").isMongoId(),
      check("id").custom(UserIdExist),
      validate,
    ],
    userController.DeleteUserDB
  );

  return router;
};
