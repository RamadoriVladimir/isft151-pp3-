import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import moldRoutes from './routes/moldRoutes.js';
import conn from './db/db.js';
import { errorHandler } from './middleware/validationMiddleware.js';
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
        
        // Esto permite acceder a: http://localhost:5050/storage/svgs/archivo.svg
        const storagePath = path.join(__dirname, "../storage");
        console.log("Sirviendo archivos estáticos desde:", storagePath);
        this.app.use("/storage", express.static(storagePath));
        
        this.app.use(this.requireCacheNoStore);
    }

    requireCacheNoStore(req, res, next) {
        res.setHeader("Cache-Control", "no-store");
        next();
    }

    routes() {
        this.app.use("/auth", authRoutes);
        this.app.use("/mold", moldRoutes);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "../frontend/index.html"));
        });

        this.app.get("/auth/login", (req, res) => {
            res.sendFile(path.join(__dirname, "../frontend/index.html"));
        });

        this.app.get("/auth/register", (req, res) => {
            res.sendFile(path.join(__dirname, "../frontend/index.html"));
        });

        this.app.get("/dashboard", (req, res) => {
            res.sendFile(path.join(__dirname, "../frontend/index.html"));
        });

        this.app.get("/test-storage", (req, res) => {
            const fs = require('fs');
            const storagePath = path.join(__dirname, "../storage");
            
            try {
                const files = this.listFilesRecursive(storagePath);
                res.json({
                    message: "Archivos en storage:",
                    storagePath: storagePath,
                    files: files
                });
            } catch (err) {
                res.status(500).json({
                    error: err.message
                });
            }
        });

        this.app.use(errorHandler);
    }

    listFilesRecursive(dir, fileList = []) {
        const fs = require('fs');
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                this.listFilesRecursive(filePath, fileList);
            } else {
                fileList.push(filePath);
            }
        });
        
        return fileList;
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
