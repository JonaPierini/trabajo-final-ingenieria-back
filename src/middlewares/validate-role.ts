import { NextFunction, Request, Response } from "express";

//Validaciones que vienen de expresss-validatoer
//Next es una funcion que se ejecuta despues de hacer las validaciones
export const validateRole = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.user) {
    return res.status(500).json({
      msg: "Se quiere verificar el role sin validar el token primero",
    });
  }

  const { rol, name } = req.body.user;

  if (rol !== "ADMIN_ROLE") {
    return res.status(401).json({
      msg: `${name} no es administrador - No puede hacer esto`,
    });
  }

  next();
};
