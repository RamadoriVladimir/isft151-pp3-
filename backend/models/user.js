import bcrypt from "bcrypt";

export default class User {
    constructor({ id = null, name, email, password, role = "user", creation_date = null }, db = null) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = "user";
        this.creation_date = creation_date || new Date().toISOString();
        this.db = db;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            creation_date: this.creation_date,
        };
    }

    static validateInput(userData) {
        if (!userData.name && !userData.username) throw new Error("Name o username es requerido");
        if (!userData.email) throw new Error("Email es requerido");
        if (!userData.password) throw new Error("Password es requerido");
        this.checkPasswordStrength(userData.password);

        return {
            name: userData.name || userData.username,
            email: userData.email,
            password: userData.password,
            role: "user",
            creation_date: new Date().toISOString()
        };
    }

    static async create(db, userData) {
        const validData = this.validateInput(userData);
        await db.insertUserToDB(validData);
        const row = await db.getUserByEmail(validData.email);
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

    static async update(db, updates) {
        if (updates.name) this.name = updates.name;
        if (updates.email) this.email = updates.email;
        if (updates.password) this.password = updates.password;
        if (updates.role) this.role = updates.role;

        await db.updateUserInDB(this.id, {
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role,
        });

        return this;
    }

    static async delete(db) {
        await db.deleteUserFromDB(this.id);
        return true;
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static checkPasswordStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            throw new Error(`La contraseña debe tener al menos ${minLength} caracteres`);
        }
        if (!hasUpperCase) {
            throw new Error("La contraseña debe contener al menos una letra mayuscula");
        }
        if (!hasLowerCase) {
            throw new Error("La contraseña debe contener al menos una letra minuscula");
        }
        if (!hasNumbers) {
            throw new Error("La contraseña debe contener al menos un numero");
        }
        if (!hasSpecialChars) {
            throw new Error("La contraseña debe contener al menos un caracter especial");
        }

        return true;
    }

    static async createInstanceFromRow(row) {
        return new User({
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.pass_hash,
            role: row.role,
            creation_date: row.creation_date,
        });
    }

    static async validateUserData(userData, db) {
        const row = await db.getUserByEmail(userData.email);
        if (!row) throw new Error("Credenciales invalidas");

        const user = this.createInstanceFromRow(row);
        const passwordMatch = await this.verifyPassword(userData.password, user.password);
        if (!passwordMatch) throw new Error("Credenciales invalidas");

        return user;
    }

    static async checkEmailExists(userdata, db) {
        const row = await db.getUserByEmail(userdata.email);
        return !!row;
    }
}
