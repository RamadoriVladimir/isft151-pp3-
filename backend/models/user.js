import bcrypt from "bcrypt";

export default class User {
    constructor({ id = null, name, email, password, role = "user", creation_date = null }, db = null) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.creation_date = creation_date || new Date().toISOString();
        this.db = db;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            creation_date: this.creation_date
        };
    }
    
    static async create(db, userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        await db.insertUserToDB({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || "user"
        });
        
        const row = await db.getUserByEmail(userData.email);
        return this.createInstanceFromRow(row);
    }

    static async findByEmail(db, email) {
        const row = await db.getUserByEmail(email);
        if (!row) return null;
        return this.createInstanceFromRow(row);
    }

    static async findById(db, id) {
        const row = await db.getUserById(id);
        if (!row) return null;
        return this.createInstanceFromRow(row);
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async validateUserData(userData, db) {
        const row = await db.getUserByEmail(userData.email);
        if (!row) throw new Error("Credenciales inválidas");

        const user = await this.createInstanceFromRow(row);
        const passwordMatch = await this.verifyPassword(userData.password, user.password);
        if (!passwordMatch) throw new Error("Credenciales inválidas");

        return user;
    }

    static async checkEmailExists(userData, db) {
        const row = await db.getUserByEmail(userData.email);
        return !!row;
    }

    static async createInstanceFromRow(row) {
        return new User({
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.pass_hash,
            role: row.role,
            creation_date: row.creation_date
        });
    }
}