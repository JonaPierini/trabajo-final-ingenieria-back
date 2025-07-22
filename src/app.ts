import { DbConnection } from "./database/config";
import { Server } from "./presentation/server";

(async () => {
  // CONEXIÓN A BASE DE DATOS (singleton)
  await DbConnection.getInstance().connect();

  // INICIAR SERVIDOR
  new Server().start();
})();
