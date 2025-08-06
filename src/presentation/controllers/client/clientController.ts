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

  public PutClient = async (req: Request, res: Response) => {
    const id = req.params.id;

    // Buscamos el cliente actual por ID
    const clienteActual = await ClientModel.findById(id);
    if (!clienteActual) {
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }

    const { name, email, address, location, provinces, state } = req.body;

    const normalizedEmail = email?.toLowerCase();

    // Verificar si el email cambió (case-insensitive)
    if (
      normalizedEmail &&
      normalizedEmail !== clienteActual.email.toLowerCase()
    ) {
      const emailExists = await UserModel.findOne({
        email: normalizedEmail,
      });

      // Solo bloqueamos si existe y NO es el mismo cliente
      if (emailExists && emailExists._id.toString() !== id) {
        return res.status(400).json({
          msg: "Ya existe un usuario con ese email.",
        });
      }
    }

    // Solo actualizamos los campos permitidos
    const upDateClient = {
      name,
      email: normalizedEmail,
      address,
      location,
      provinces,
      state,
    };

    const client = await ClientModel.findByIdAndUpdate(id, upDateClient, {
      new: true,
    });

    res.status(200).json({
      msg: "El cliente fue actualizado con éxito",
      client,
    });
  };

  //Delete => state
  public DeleteClient = async (req: Request, res: Response) => {
    const id = req.params.id;
    const cliente = await ClientModel.findByIdAndUpdate(
      id,
      { state: false },
      //con el new devuelvo el valor del usuario actualizado
      { new: true }
    );
    res.status(200).json({
      msg: "Cambio de estado = estado(false)",
      cliente,
    });
  };

  //DELETE CLIENT DB

  public DeleteClientDB = async (req: Request, res: Response) => {
    const id = req.params.id;
    const client = await ClientModel.findByIdAndDelete(id);

    res.status(200).json({
      msg: "El cliente borrado fue",
      client,
    });
  };
}
