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
      name: req.body.name,
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

  public DeleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;
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

  public PutUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    //Actualizo el  rol, state y password
    const upDateUser = {
      //name: req.body.name,
      //email: req.body.email,
      rol: req.body.rol,
      password: req.body.password,
      state: req.body.state,
      // createdAt: req.body.createdAt,
    };
    if (upDateUser.password) {
      // Encriptar la contraseña
      const salt = bcrypt.genSaltSync();
      upDateUser.password = bcrypt.hashSync(upDateUser.password, salt);
    }

    // Actualizar el usuario y devolver el documento actualizado
    const usuario = await UserModel.findByIdAndUpdate(id, upDateUser, {
      new: true,
    });

    res.status(200).json(usuario);
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
