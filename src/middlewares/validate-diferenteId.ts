import { NextFunction, Request, Response } from "express";

//Validaciones que vienen de expresss-validatoer
//Next es una funcion que se ejecuta despues de hacer las validaciones
export const validateDiferenteId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.user) {
    return res.status(500).json({
      msg: "Se quiere verificar el role sin validar el token primero",
    });
  }

  const { id } = req.params;

  //ACA (req.body.user._id) tengo la informacion del usuario que hace la accion porq el midlware anterior que es el validate-token me la otorga
  const userId = req.body.user._id;

  //Encontramos que si el usuario es el mismo no se puede borrar
  if (id === userId.toString()) {
    return res.status(401).json({
      msg: `Oiga no podes borrarte a vos mismo`,
    });
  }

  next();
};
