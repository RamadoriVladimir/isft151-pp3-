import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import dotenv from "dotenv";

dotenv.config();

class SQLiteConnection {
    constructor() {
        this.dbPath = process.env.DB_PATH || "./database.sqlite";
        this.db = null;
    }

    async connect() {
        try {
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database,
            });

            await this.initializeTables();
            console.log("Conectado correctamente a SQLite");
            console.log(`Usando base de datos: ${this.dbPath}`);

            return this.db;
        } catch (err) {
            console.error("Error conectando a SQLite:", err);
            process.exit(1);
        }
    }

    async disconnect() {
        if (this.db) {
            await this.db.close();
            console.log("Desconectado de SQLite");
        }
    }

    async initializeTables() {
        try {
            await this.db.exec(`
                ALTER TABLE molds ADD COLUMN svg_path VARCHAR(300);
            `);
            console.log("Columna svg_path agregada a la tabla molds");
        } catch (err) {
            if (!err.message.includes("duplicate column")) {
                console.warn("Nota: Columna svg_path podría ya existir en molds");
            }
        }

        await this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            pass_hash VARCHAR(350) NOT NULL,
            role TEXT CHECK(role IN ('admin', 'user', 'moderator')) DEFAULT 'user',
            creation_date DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL,
            description TEXT(100),
            creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            users_id INTEGER NOT NULL,
            FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS molds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(100) NOT NULL,
            width DECIMAL(10,2),
            height DECIMAL(10,2),
            svg_path VARCHAR(300),
            creation_date DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS molds_collections (
            collections_id INTEGER NOT NULL,
            molds_id INTEGER NOT NULL,
            KEY VARCHAR(45),
            PRIMARY KEY (collections_id, molds_id),
            FOREIGN KEY (collections_id) REFERENCES collections(id) ON DELETE CASCADE,
            FOREIGN KEY (molds_id) REFERENCES molds(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS drafts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT(100),
            creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            users_id INTEGER NOT NULL,
            collections_id INTEGER NOT NULL,
            FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (collections_id) REFERENCES collections(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS molds_drafts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            position_x DECIMAL(10,2),
            position_y DECIMAL(10,2),
            rotation DECIMAL(5,2),
            scaling DECIMAL(5,2),
            drafts_id INTEGER NOT NULL,
            molds_id INTEGER NOT NULL,
            FOREIGN KEY (drafts_id) REFERENCES drafts(id) ON DELETE CASCADE,
            FOREIGN KEY (molds_id) REFERENCES molds(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_collections_users ON collections(users_id);
        CREATE INDEX IF NOT EXISTS idx_drafts_users ON drafts(users_id);
        CREATE INDEX IF NOT EXISTS idx_drafts_collections ON drafts(collections_id);
        CREATE INDEX IF NOT EXISTS idx_molds_drafts_drafts ON molds_drafts(drafts_id);
        CREATE INDEX IF NOT EXISTS idx_molds_drafts_molds ON molds_drafts(molds_id);
        `);

        console.log("Tablas inicializadas correctamente");
    }

    // ==================== USERS ====================
    async insertUserToDB(userData) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        if (!userData.password) {
            throw new Error("Password es requerido");
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = { ...userData, password: hashedPassword };

        if (!user.name || !user.email) {
            throw new Error("Name y email son requeridos");
        }

        await this.db.run(
            `INSERT INTO users (name, email, pass_hash, role) VALUES (?, ?, ?, ?)`,
            [user.name, user.email, user.password, user.role || "user"]
        );

        console.log(`Usuario ${user.name} insertado correctamente`);
    }

    async getUserByEmail(email) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        return await this.db.get(
            `SELECT id, name, email, pass_hash, role, creation_date FROM users WHERE email = ?`,
            [email]
        );
    }

    async getUserById(id) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        return await this.db.get(
            `SELECT id, name, email, pass_hash, role, creation_date FROM users WHERE id = ?`,
            [id]
        );
    }

    // ==================== COLLECTIONS ====================
    async createCollection(name, description, userId) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        const result = await this.db.run(
            `INSERT INTO collections (name, description, users_id) VALUES (?, ?, ?)`,
            [name, description, userId]
        );

        return result.lastID;
    }

    // ==================== DRAFTS ====================
    async createDraft(description, userId, collectionsId) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        const result = await this.db.run(
            `INSERT INTO drafts (description, users_id, collections_id) VALUES (?, ?, ?)`,
            [description, userId, collectionsId]
        );

        return result.lastID;
    }

    async getDraftsByUser(userId) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        return await this.db.all(
            `SELECT d.*, c.name as collection_name 
            FROM drafts d 
            JOIN collections c ON d.collections_id = c.id 
            WHERE d.users_id = ?`,
            [userId]
        );
    }

    async addMoldToDraft(draftId, moldId, positionX, positionY, rotation, scaling) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        const result = await this.db.run(
            `INSERT INTO molds_drafts (position_x, position_y, rotation, scaling, drafts_id, molds_id) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [positionX, positionY, rotation, scaling, draftId, moldId]
        );

        return result.lastID;
    }

    // ==================== MOLDS ====================
    async createMold(name, type, width, height, svgPath) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        const result = await this.db.run(
            `INSERT INTO molds (name, type, width, height, svg_path) VALUES (?, ?, ?, ?, ?)`,
            [name, type, width, height, svgPath]
        );

        return result.lastID;
    }

    async getMoldById(id) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        return await this.db.get(
            `SELECT id, name, type, width, height, svg_path, creation_date FROM molds WHERE id = ?`,
            [id]
        );
    }

    async getAllMolds() {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        return await this.db.all(
            `SELECT id, name, type, width, height, svg_path, creation_date FROM molds`
        );
    }

    async updateMold(id, moldData) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        await this.db.run(
            `UPDATE molds SET name = ?, type = ?, width = ?, height = ?, svg_path = ? WHERE id = ?`,
            [moldData.name, moldData.type, moldData.width, moldData.height, moldData.svg_path, id]
        );
    }

    async deleteMold(id) {
        if (!this.db) {
            throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        }

        await this.db.run(`DELETE FROM molds WHERE id = ?`, [id]);
    }
}

const conn = new SQLiteConnection();
export default conn;