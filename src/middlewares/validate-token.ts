import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envs } from "../config/envs";
import { UserModel } from "../presentation/models/user.model";

export const validateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //RECIBIMOS EL TOKEN del cliente y, a partir de ese token, sabemos los datos del cliente (id)
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      msg: "No hay token en la petición - acordate de mandarlo en el header",
    });
  }

  try {
    // Verificamos el token y forzamos el tipo del payload
    //esto es para verificar el token
    const { id } = jwt.verify(token, envs.SECRETORPRIVATEKEY) as JwtPayload;

    // leer el usuario que corresponde al id
    const usuario = await UserModel.findById(id);

    if (!usuario) {
      return res.status(401).json({
        msg: "Token no válido - usuario no existe en la base de datos",
      });
    }

    // Verificar si el estado del usuario es true
    if (!usuario.state) {
      return res.status(401).json({
        msg: "Token no válido - usuario con estado: false",
      });
    }

    // Asignamos al usuario a req.user en lugar de modificar el body
    //aca le asignamos al req.body.user el usuario encontrado en el modelo
    req.body.user = usuario;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      msg: "Token no válido",
    });
  }
};

// Parse - JWT - Obtener Payload y fecha de creación y expiración
// function parseJwt (token) {
// 	var base64Url = token.split('.')[1];
// 	var base64 = base64Url.replace('-', '+').replace('_', '/');
// 	return JSON.parse(window.atob(base64));
// };
