import { Request, Response } from "express";
import { validationResult } from "express-validator";

//Next es una funcion que se ejecuta despues de hacer las validaciones
export const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  next();
};
