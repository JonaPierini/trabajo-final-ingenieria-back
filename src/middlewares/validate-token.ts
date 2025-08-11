import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envs } from "../config/envs";
import { UserModel } from "../presentation/models/user.model";

export const validateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("x-token");
  if (!token)
    return res
      .status(401)
      .json({
        msg: "No hay token en la petición - acordate de mandarlo en el header",
      });

  try {
    const { id } = jwt.verify(token, envs.SECRETORPRIVATEKEY) as JwtPayload;
    const usuario = await UserModel.findById(id);
    if (!usuario)
      return res
        .status(401)
        .json({
          msg: "Token no válido - usuario no existe en la base de datos",
        });
    if (!usuario.state)
      return res
        .status(401)
        .json({ msg: "Token no válido - usuario con estado: false" });

    // ✅ Guardar en req.usuario (no en req.body)
    (req as any).usuario = usuario;
    // ❌ NO: req.body.user = usuario;

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token no válido" });
  }
};

// Parse - JWT - Obtener Payload y fecha de creación y expiración
// function parseJwt (token) {
// 	var base64Url = token.split('.')[1];
// 	var base64 = base64Url.replace('-', '+').replace('_', '/');
// 	return JSON.parse(window.atob(base64));
// };
