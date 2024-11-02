import "dotenv/config";
import { get } from "env-var";

//El paquete env-var es para tipar las envar

export const envs = {
  PORT: get("PORT").required().asPortNumber(),
  MONGODB_CNN: get("MONGODB_CNN").required().asString(),
  SECRETORPRIVATEKEY: get("SECRETORPRIVATEKEY").required().asString(),
};
