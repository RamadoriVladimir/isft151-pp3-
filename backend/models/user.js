import bcrypt from "bcrypt";

export default class User {
    constructor({ id = null, name, email, password, role = null, creation_date = null, db = null }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.creation_date = creation_date;
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

    static async create(db, userData) {
        if (!userData.password) {
            throw new Error("Password es requerido");
        }
        
        await db.insertUserToDB(userData);
        return await User.findByEmail(db, userData.email);
    }

    static async findByEmail(db, email) {
        const row = await db.getUserByEmail(email);
        if (!row) return null;
        
        User.createInstanceFromRow(row);
    }

    static async findById(db, id) {
        const row = await db.getUserById(id);
        if (!row) return null;
        
        User.createInstanceFromRow(row);
    }

    async update(db, updates) {
        if (updates.name !== undefined) this.name = updates.name;
        if (updates.email !== undefined) this.email = updates.email;
        if (updates.password !== undefined) this.password = updates.password;
        if (updates.role !== undefined) this.role = updates.role;

        await db.updateUserInDB(this.id, {
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role,
        });
        return this;
    }

    async delete(db) {
        await db.deleteUserFromDB(this.id);
        return true;
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    checkPasswordStrength(password) {
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

    static async validateUserData(userData, db) {
        const row = await db.getUserByEmail(userData.email);
        if (!row) return res.status(401).json({ message: "Credenciales invalidas" });

        const user = User.createInstanceFromRow(row);
        const passwordMatch = await User.verifyPassword(userData.password, user.password);
        if (!passwordMatch) return res.status(401).json({ message: "Credenciales invalidas" });

        return user;
    }

    static createInstanceFromRow(row) {
        return new User({
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.pass_hash,
            role: row.role,
            creation_date: row.creation_date,
        });
    }

    static async checkEmailExists(email, db) {
        const emailExists = await db.getUserByEmail(email);

        if (emailExists) {
            return true;
        }
    }
}