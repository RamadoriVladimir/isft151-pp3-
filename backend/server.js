import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import conn from './db/db.js';
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5050;

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.app.use(express.static(path.join(__dirname, "../frontend")));
    this.app.use(this.requireCacheNoStore);
  }

  requireCacheNoStore(req, res, next) {
    res.setHeader("Cache-Control", "no-store");
    next();
  }

  routes() {
    this.app.use("/auth", authRoutes);
  }

  async start() {
    try {
      await conn.connect();
      this.app.listen(this.port, () => {
        console.log(`Server running on http://localhost:${this.port}`);
        console.log(`Server running on port ${this.port}`);
      });
    } catch (err) {
      console.error("Error arrancando el servidor:", err);
      process.exit(1);
    }
  }

  async stop() {
    try {
      await conn.disconnect();
      console.log("Servidor detenido correctamente");
    } catch (err) {
      console.error("Error deteniendo el servidor:", err);
    }
  }
}

const server = new Server();
export default server;