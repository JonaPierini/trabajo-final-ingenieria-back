import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { ClientModel } from "../../models/client.model";

export class ClientController {
  constructor() {}

  //GET ALL TODO
  public AllClient = async (req: Request, res: Response) => {
    const allClient = await ClientModel.find();
    res.json({
      msg: "Todos los clientes en la BD",
      allClient,
    });
  };

  //CREATE NEW CLIENT
  public NewClient = async (req: Request, res: Response) => {
    const newClient = await ClientModel.create({
      name: req.body.name.toUpperCase(),
      email: req.body.email,
      address: req.body.address,
      location: req.body.location,
      provinces: req.body.provinces,
      createdAt: req.body.createdAt,
    });

    //Guarda en bd
    await newClient.save();

    //Lo que muestro en postman
    res.status(200).json({
      msg: "Nuevo cliente creado",
      newClient,
    });
  };
}
