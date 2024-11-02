import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import * as bcrypt from "bcryptjs";
import { generarJWT } from "../../../helpers/generate-jwt";

export class AuthController {
  constructor() {}

  //LOGIN
  public Login = async (req: Request, res: Response) => {
    //ACA ya se que me mandaron el email y password pq es lo que puse en la ruta
    const email = req.body.email;
    const password = req.body.password;

    try {
      // Verificar si el email existe en la BD
      const usuario = await UserModel.findOne({ email });
      if (!usuario) {
        return res.status(400).json({
          msg: "Usuario / Password no son correctos - correo",
        });
      }

      // SI el usuario está activo
      if (!usuario.state) {
        return res.status(400).json({
          msg: "Usuario / Password no son correctos - estado: false",
        });
      }

      // Verificar la contraseña. Comparamos el password del body con el password de la base de datos
      const validPassword = bcrypt.compareSync(password, usuario.password);
      if (!validPassword) {
        return res.status(400).json({
          msg: "Usuario / Password no son correctos - password",
        });
      }

      // Generar el JWT y le paso el usuario.id para generar ese token
      const token = await generarJWT(usuario.id);

      res.json({
        msg: "Usuario existe - Puede Ingresar",
        usuario,
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: "Hable con el administrador",
      });
    }
  };
}
