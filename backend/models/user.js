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

    static getAPISpecifications() {
        return {
            login: {
                method: "POST",
                input: {
                    required: ["email", "password"],
                    schema: {
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 1 }
                    }
                },
                output: {
                    success: {
                        status: 200,
                        schema: {
                            message: { type: "string" },
                            token: { type: "string" },
                            user: {
                                type: "object",
                                properties: ["id", "name", "email", "role", "creation_date"]
                            }
                        }
                    },
                    error: {
                        status: [401, 500],
                        schema: {
                            message: { type: "string" }
                        }
                    }
                }
            },
            register: {
                method: "POST",
                input: {
                    required: ["email", "password"],
                    optional: ["name", "username"],
                    schema: {
                        name: { type: "string", minLength: 1, maxLength: 50 },
                        username: { type: "string", minLength: 1, maxLength: 50 },
                        email: { type: "string", format: "email", maxLength: 100 },
                        password: { type: "string", minLength: 8 },
                        role: { type: "string", enum: ["admin", "user", "moderator"] }
                    }
                },
                output: {
                    success: {
                        status: 201,
                        schema: {
                            message: { type: "string" }
                        }
                    },
                    error: {
                        status: [400],
                        schema: {
                            message: { type: "string" }
                        }
                    }
                }
            }
        };
    }

    static validateAPIInput(endpoint, req) {
        const specs = this.getAPISpecifications();
        const spec = specs[endpoint];

        if (!spec) {
            throw new Error(`Endpoint ${endpoint} no tiene especificación definida`);
        }
        if (req.method !== spec.method) {
            throw new Error(`Método HTTP inválido. Se esperaba ${spec.method}, se recibió ${req.method}`);
        }

        const data = req.body;

        for (const field of spec.input.required) {
            if (!data[field]) {
                throw new Error(`Campo requerido faltante: ${field}`);
            }
        }
        for (const field in data) {
            if (spec.input.schema[field]) {
                this.validateField(field, data[field], spec.input.schema[field]);
            }
        }

        return true;
    }

    static validateField(fieldName, value, schema) {
        if (schema.type === "string" && typeof value !== "string") {
            throw new Error(`${fieldName} debe ser de tipo string`);
        }
        if (schema.format === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                throw new Error(`${fieldName} debe ser un email válido`);
            }
        }
        if (schema.minLength && value.length < schema.minLength) {
            throw new Error(`${fieldName} debe tener al menos ${schema.minLength} caracteres`);
        }
        if (schema.maxLength && value.length > schema.maxLength) {
            throw new Error(`${fieldName} no debe exceder ${schema.maxLength} caracteres`);
        }
        if (schema.enum && !schema.enum.includes(value)) {
            throw new Error(`${fieldName} debe ser uno de: ${schema.enum.join(", ")}`);
        }
        return true;
    }

    static validateAPIOutput(endpoint, status, data) {
        const specs = this.getAPISpecifications();
        const spec = specs[endpoint];

        if (!spec) {
            throw new Error(`Endpoint ${endpoint} no tiene especificación definida`);
        }

        let outputSpec;
        
        if (status >= 200 && status < 300) {
            outputSpec = spec.output.success;
        } else {
            outputSpec = spec.output.error;
        }

        const expectedStatus = Array.isArray(outputSpec.status) 
            ? outputSpec.status 
            : [outputSpec.status];

        if (!expectedStatus.includes(status)) {
            throw new Error(`Status code ${status} no esperado para ${endpoint}`);
        }

        this.validateOutputSchema(data, outputSpec.schema);

        return true;
    }

    static validateOutputSchema(data, schema) {
        for (const field in schema) {
            const fieldSpec = schema[field];

            if (!data.hasOwnProperty(field)) {
                throw new Error(`Campo requerido en salida: ${field}`);
            }
            if (fieldSpec.type === "string" && typeof data[field] !== "string") {
                throw new Error(`${field} en salida debe ser string`);
            }
            if (fieldSpec.type !== "object") return;

            if (typeof data[field] !== "object" || data[field] === null) {
                throw new Error(`${field} en salida debe ser object`);
            }
            if (!fieldSpec.properties) return;

            for (const prop of fieldSpec.properties) {
                if (!Object.prototype.hasOwnProperty.call(data[field], prop)) {
                    throw new Error(`Propiedad ${prop} faltante en ${field}`);
                }
            }
        }

        return true;
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

        const user = await this.createInstanceFromRow(row);
        const passwordMatch = await this.verifyPassword(userData.password, user.password);
        if (!passwordMatch) throw new Error("Credenciales invalidas");

        return user;
    }

    static async checkEmailExists(userdata, db) {
        const row = await db.getUserByEmail(userdata.email);
        return !!row;
    }
}