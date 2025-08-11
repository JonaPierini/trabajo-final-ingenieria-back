import { NextFunction, Request, Response } from "express";

export const validateRole = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const usuario = (req as any).usuario; // seteado por validateJWT

  if (!usuario) {
    return res.status(500).json({
      msg: "Se quiere verificar el role sin validar el token primero",
    });
  }

  const { rol, name } = usuario;

  if (rol !== "ADMIN_ROLE") {
    return res.status(403).json({
      msg: `${name} no es administrador - No puede hacer esto`,
    });
  }

  next();
};
