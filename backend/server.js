import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import conn from './db/db.js';

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
  }

  routes() {
    this.app.use("/auth", authRoutes);
  }

  async start() {
    try {
      await conn.connect();
      this.app.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
      });
    } catch (err) {
      console.error("Error arrancando el servidor:", err);
      process.exit(1);
    }
  }
}

const server = new Server();
export default server;
