import bcrypt from "bcrypt";
import { MongoClient, ServerApiVersion } from "mongodb"
import UserFactory from "../userFactory.js"; 
import dotenv from "dotenv";

dotenv.config();

class MongoDBConnection {
  constructor() {
    this.uri = process.env.MONGO_URI || "";
    this.dbName = process.env.DB_NAME || "authdb";
    this.client = new MongoClient(this.uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    this.db = null;
    this.userDBcollection = null; 
  }

  async connect() {
    try {
      await this.client.connect();
      await this.client.db("admin").command({ ping: 1 });
      console.log("Conectado correctamente a MongoDB");

      this.db = this.client.db(this.dbName);
      this.userDBcollection = this.db.collection("users");
      console.log(`Usando base de datos: ${this.dbName}`);
      return this.db;
    } catch (err) {
      console.error("Error conectando a MongoDB:", err);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log("Desconectado de MongoDB");
    }
  }

  async insertUserToDB(userData) {
    const { email, password, username } = userData;

    if (!this.userDBcollection) {
      throw new Error("La coleccion no está inicializada. Llama a connect() primero.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = UserFactory.createFromRequest(userData, hashedPassword);

    await this.userDBcollection.insertOne({
      username: user.username,
      email: user.email,
      password: user.password,
    });

    console.log(`Usuario ${user.username} insertado correctamente`);
  }
}

const conn = new MongoDBConnection();
export default conn;
