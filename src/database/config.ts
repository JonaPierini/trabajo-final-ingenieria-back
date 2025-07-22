import { connect } from "mongoose";
import { envs } from "../config/envs";

export class DbConnection {
  private static instance: DbConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DbConnection {
    if (!DbConnection.instance) {
      DbConnection.instance = new DbConnection();
    }
    return DbConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("Ya hay una conexión activa");
      return;
    }

    try {
      await connect(envs.MONGODB_CNN);
      this.isConnected = true;
      console.log("Conexión a la base de datos exitosa");
    } catch (error) {
      console.error("Error al conectar con la base de datos:", error);
      throw error;
    }
  }
}
