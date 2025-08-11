import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import * as bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envs } from "../../../config/envs";

export class UserController {
  constructor() {}

  //GET ALL TODO
  public AllUsers = async (req: Request, res: Response) => {
    const allUser = await UserModel.find();
    res.json({
      msg: "Todos los usuarios en la BD",
      allUser,
    });
  };

  //GET USER BY ID
  public UserById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const userById = await UserModel.findById(id);
    res.json({
      msg: "Usuario encontrado: ",
      userById,
    });
  };

  //CREATE NEW USER
  public NewUser = async (req: Request, res: Response) => {
    const newUser = await UserModel.create({
      name: req.body.name.toUpperCase(),
      email: req.body.email,
      rol: req.body.rol,
      state: req.body.state,
      createdAt: req.body.createdAt,
      password: req.body.password,
    });

    //Encriptar la contraseña
    const salt = bcrypt.genSaltSync();
    newUser.password = bcrypt.hashSync(newUser.password, salt);

    //Guarda en bd
    await newUser.save();

    //Lo que muestro en postman
    res.status(200).json({
      msg: "Nuevos usuarios creado",
      newUser,
    });
  };

  //DELETE USER STATE
  public DeleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log(id);
    const user = await UserModel.findByIdAndUpdate(
      id,
      { state: false },
      //con el new devuelvo el valor del usuario actualizado
      { new: true }
    );
    res.status(200).json({
      msg: "Cambio de estado = estado(false)",
      user,
    });
  };

  //DELETE USER DB
  public DeleteUserDB = async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await UserModel.findByIdAndDelete(id);
    const token = req.header("x-token");

    // Hacemos la verificacion del token para poder agarrar la data y con esa data tomamos el id del usuario que hizo la accion
    const data = jwt.verify(token!, envs.SECRETORPRIVATEKEY) as JwtPayload;
    //Encontramos el usuario que hizo la accion
    const userAction = await UserModel.findById(data.id);

    res.status(200).json({
      msg: "El usuario borrado fue",
      user,
      msgAction: "El usuario que hizo la accion fue",
      userAction,
    });
  };

  //PUT USER
  public PutUser = async (req: Request, res: Response) => {
    const id = req.params.id;

    // ✅ viene del middleware validateJWT
    const loggedUserId = (req as any).usuario?._id?.toString();
    if (!loggedUserId) {
      return res.status(401).json({ msg: "Token faltante o inválido" });
    }

    // Impedir que el admin se edite a sí mismo desde esta ruta
    if (id === loggedUserId) {
      return res
        .status(403)
        .json({ msg: "No podés editarte a vos mismo desde esta ruta." });
    }

    const { name, email, rol, state } = req.body;

    // Verificar si el usuario a actualizar existe
    const userToUpdate = await UserModel.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ msg: "Usuario no encontrado." });
    }

    // Validar email duplicado si lo cambian
    if (email && email !== userToUpdate.email) {
      const emailExists = await UserModel.findOne({ email });
      if (emailExists) {
        return res
          .status(400)
          .json({ msg: "Ya existe un usuario con ese email." });
      }
    }

    // Construir update solo con campos permitidos
    const upDateUser: Partial<typeof userToUpdate> = {
      name,
      email,
      rol,
      state,
    };

    const usuario = await UserModel.findByIdAndUpdate(id, upDateUser, {
      new: true,
    });

    return res.status(200).json(usuario);
  };

  // PATHC USER (HOMESCRENN) NAME AND PASSWORD
  public PatchUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, password } = req.body;

    // ✅ viene del middleware validateJWT
    const uidFromToken = (req as any).usuario?._id?.toString();
    if (!uidFromToken) {
      return res.status(401).json({ msg: "Token faltante o inválido" });
    }

    // Solo puede editarse a sí mismo
    if (id !== uidFromToken) {
      return res
        .status(403)
        .json({ msg: "No puedes editar a otros usuarios." });
    }

    // Construir update solo con campos permitidos
    const upDateUser: Partial<{ name: string; password: string }> = {};

    if (typeof name === "string") upDateUser.name = name.trim();

    if (typeof password === "string" && password.trim().length > 0) {
      const salt = bcrypt.genSaltSync();
      upDateUser.password = bcrypt.hashSync(password, salt);
    }

    const usuario = await UserModel.findByIdAndUpdate(id, upDateUser, {
      new: true,
    });

    return res.status(200).json(usuario);
  };

  //GET BY LIMIT (PAGINATIO)
  public PaginationUser = async (req: Request, res: Response) => {
    const { limite = 5, desde = 0 } = req.query;
    //Me va a traer aquellos usuarios que tengan el estado en true
    const query = { state: true };

    const [total, usuarios] = await Promise.all([
      UserModel.countDocuments(query),
      UserModel.find(query).skip(Number(desde)).limit(Number(limite)),
    ]);

    res.status(200).json({
      total,
      usuarios,
    });
  };
}
