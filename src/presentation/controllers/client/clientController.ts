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

  //GET CLIENT BY ID
  public ClientById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const clientById = await ClientModel.findById(id);
    res.json({
      msg: "cliente encontrado: ",
      clientById,
    });
  };

  //CREATE NEW CLIENT
  public NewClient = async (req: Request, res: Response) => {
    const newClient = await ClientModel.create({
      name: req.body.name.toUpperCase(),
      email: req.body.email.toLowerCase(),
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

  //UPDATE CLIENT
  public PutUClient = async (req: Request, res: Response) => {
    const id = req.params.id;
    //Actualizo el  name, email, address, location, provinces
    const upDateClient = {
      name: req.body.name.toUpperCase(),
      email: req.body.email.toLowerCase(),
      address: req.body.address,
      location: req.body.location,
      provinces: req.body.provinces,
    };

    // Actualizar el cliente y devolver el documento actualizado
    const client = await ClientModel.findByIdAndUpdate(id, upDateClient, {
      new: true,
    });
    res.status(200).json({
      msg: "El cliente fue actualizado con exito",
      client,
    });
  };

  //DELETE CLIENT

  public DeleteClientDB = async (req: Request, res: Response) => {
    const id = req.params.id;
    const client = await ClientModel.findByIdAndDelete(id);

    res.status(200).json({
      msg: "El cliente borrado fue",
      client,
    });
  };
}
