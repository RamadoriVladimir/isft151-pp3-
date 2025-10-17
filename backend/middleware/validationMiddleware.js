export class ValidationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "ValidationError";
        this.details = details;
    }
}

export function getAPISpecifications() {
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

export function validateField(fieldName, value, schema) {
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

export function validateAPIInput(endpoint, req) {
    const specs = getAPISpecifications();
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
            validateField(field, data[field], spec.input.schema[field]);
        }
    }

    return true;
}

export function validateOutputSchema(data, schema) {
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

export function validateAPIOutput(endpoint, status, data) {
    const specs = getAPISpecifications();
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

    validateOutputSchema(data, outputSpec.schema);

    return true;
}

export function validateLoginInput(req, res, next) {
    try {
        validateAPIInput("login", req);
        next();
    } catch (error) {
        return res.status(400).json({
            message: "Errores de validación",
            errors: { general: error.message }
        });
    }
}

export function validateRegisterInput(req, res, next) {
    const { username, name, email, password } = req.body;
    const errors = {};
    const passwordErrors = [];

    const userName = username || name;

    if (!userName) {
        errors.name = "Nombre o usuario es requerido";
    } else if (userName.length < 1 || userName.length > 50) {
        errors.name = "Nombre debe tener entre 1 y 50 caracteres";
    }

    if (!email) {
        errors.email = "Email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Email inválido";
    } else if (email.length > 100) {
        errors.email = "Email no debe exceder 100 caracteres";
    }

    if (!password) {
        errors.password = "Password es requerido";
    } else {
        if (password.length < 8) {
            passwordErrors.push("Password debe tener al menos 8 caracteres");
        }
        if (!/[A-Z]/.test(password)) {
            passwordErrors.push("Password debe contener una mayúscula");
        }
        if (!/[a-z]/.test(password)) {
            passwordErrors.push("Password debe contener una minúscula");
        }
        if (!/\d/.test(password)) {
            passwordErrors.push("Password debe contener un número");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            passwordErrors.push("Password debe contener un carácter especial");
        }
        
        if (passwordErrors.length > 0) {
            errors.password = passwordErrors;
        }
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Errores de validación",
            errors
        });
    }

    next();
}

export function validateMoldInput(req, res, next) {
    const { name, type, width, height } = req.body;
    const errors = {};

    if (!name) {
        errors.name = "Nombre es requerido";
    } else if (name.length < 1 || name.length > 100) {
        errors.name = "Nombre debe tener entre 1 y 100 caracteres";
    }

    if (!type) {
        errors.type = "Tipo es requerido";
    } else if (type.length < 1 || type.length > 100) {
        errors.type = "Tipo debe tener entre 1 y 100 caracteres";
    }

    if (width !== undefined && width !== null) {
        if (typeof width !== "number" || width < 1) {
            errors.width = "Ancho debe ser un número positivo";
        }
    }

    if (height !== undefined && height !== null) {
        if (typeof height !== "number" || height < 1) {
            errors.height = "Alto debe ser un número positivo";
        }
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Errores de validación",
            errors
        });
    }

    next();
}

export function errorHandler(err, req, res, next) {
    console.error("Error:", err);

    if (err instanceof ValidationError) {
        return res.status(400).json({
            message: err.message,
            errors: err.details
        });
    }

    const validationKeywords = [
        "contraseña",
        "password",
        "email",
        "requerido",
        "caracteres",
        "mayúscula",
        "minúscula",
        "número",
        "especial",
        "inválido"
    ];

    const isValidationError = validationKeywords.some(keyword => 
        err.message.toLowerCase().includes(keyword)
    );

    if (isValidationError) {
        return res.status(400).json({
            message: "Errores de validación",
            errors: { validation: err.message }
        });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            message: "Token inválido o expirado"
        });
    }

    return res.status(500).json({
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
}