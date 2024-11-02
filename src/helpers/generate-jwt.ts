import jwt from "jsonwebtoken";
import { envs } from "../config/envs";

export const generarJWT = (id: String) => {
  return new Promise((resolve, reject) => {
    //payload es el ID del usuario
    const payload = { id };

    //Screto. Aca lo que le pasamos como payload es el ID del usuario. Entonces despues para verificarlo, esa verificion va a ser por medio del ID
    jwt.sign(
      payload,
      envs.SECRETORPRIVATEKEY,
      //duracion del token 4 horas
      {
        expiresIn: "4h",
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el token");
        } else {
          resolve(token);
        }
      }
    );
  });
};
