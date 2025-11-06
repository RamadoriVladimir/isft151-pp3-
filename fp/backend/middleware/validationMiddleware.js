export class ValidationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "ValidationError";
        this.details = details;
    }
}

export function isPasswordValid(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push("La contraseña debe tener al menos 8 caracteres");
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push("La contraseña debe contener al menos una letra mayúscula");
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push("La contraseña debe contener al menos una letra minúscula");
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push("La contraseña debe contener al menos un número");
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("La contraseña debe contener al menos un carácter especial");
    }
    
    return errors;
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
                    status: [401, 400, 500],
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
                    password: { type: "string", minLength: 8, requiresFormat: true },
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
        },
        get_all_molds: {
            method: "GET",
            input: {
                required: [],
                schema: {}
            },
            output: {
                success: {
                    status: 200,
                    schema: {
                        molds: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: ["id", "name", "type", "width", "height", "svg_path", "creation_date"]
                            }
                        }
                    }
                },
                error: {
                    status: [500],
                    schema: {
                        message: { type: "string" }
                    }
                }
            }
        },
        get_mold_by_id: {
            method: "GET",
            input: {
                required: ["id"],
                schema: {
                    id: { type: "string", pattern: "^[0-9]+$" }
                }
            },
            output: {
                success: {
                    status: 200,
                    schema: {
                        id: { type: "number" },
                        name: { type: "string" },
                        type: { type: "string" },
                        width: { type: "number" },
                        height: { type: "number" },
                        svg_path: { type: "string" },
                        creation_date: { type: "string" }
                    }
                },
                error: {
                    status: [404, 500],
                    schema: {
                        message: { type: "string" }
                    }
                }
            }
        },
        create_mold: {
            method: "POST",
            input: {
                required: ["name", "type"],
                optional: ["width", "height", "svg_content"],
                schema: {
                    name: { type: "string", minLength: 1, maxLength: 100 },
                    type: { type: "string", minLength: 1, maxLength: 100 },
                    width: { type: "number", minimum: 0 },
                    height: { type: "number", minimum: 0 },
                    svg_content: { type: "string" }
                }
            },
            output: {
                success: {
                    status: 201,
                    schema: {
                        message: { type: "string" },
                        mold: {
                            type: "object",
                            properties: ["id", "name", "type", "width", "height", "svg_path", "creation_date"]
                        }
                    }
                },
                error: {
                    status: [400, 500],
                    schema: {
                        message: { type: "string" },
                        errors: { type: "object" }
                    }
                }
            }
        },
        update_mold: {
            method: "PUT",
            input: {
                required: ["id"],
                optional: ["name", "type", "width", "height", "svg_content"],
                schema: {
                    id: { type: "string", pattern: "^[0-9]+$" },
                    name: { type: "string", minLength: 1, maxLength: 100 },
                    type: { type: "string", minLength: 1, maxLength: 100 },
                    width: { type: "number", minimum: 0 },
                    height: { type: "number", minimum: 0 },
                    svg_content: { type: "string" }
                }
            },
            output: {
                success: {
                    status: 200,
                    schema: {
                        message: { type: "string" },
                        mold: {
                            type: "object",
                            properties: ["id", "name", "type", "width", "height", "svg_path", "creation_date"]
                        }
                    }
                },
                error: {
                    status: [400, 404, 500],
                    schema: {
                        message: { type: "string" }
                    }
                }
            }
        },
        delete_mold: {
            method: "DELETE",
            input: {
                required: ["id"],
                schema: {
                    id: { type: "string", pattern: "^[0-9]+$" }
                }
            },
            output: {
                success: {
                    status: 200,
                    schema: {
                        message: { type: "string" }
                    }
                },
                error: {
                    status: [404, 500],
                    schema: {
                        message: { type: "string" }
                    }
                }
            }
        },
        create_collection: {
            method: "POST",
            input: {
                required: ["name", "userId"],
                optional: ["description"],
                schema: {
                    name: { type: "string", minLength: 1, maxLength: 50 },
                    description: { type: "string", maxLength: 100 },
                    userId: { type: "number", minimum: 1 }
                }
            },
            output: {
                success: {
                    status: 201,
                    schema: {
                        collectionId: { type: "number" }
                    }
                },
                error: {
                    status: [400, 500],
                    schema: {
                        message: { type: "string" }
                    }
                }
            }
        },
        create_draft: {
            method: "POST",
            input: {
                required: ["userId", "collectionsId"],
                optional: ["description"],
                schema: {
                    description: { type: "string", maxLength: 100 },
                    userId: { type: "number", minimum: 1 },
                    collectionsId: { type: "number", minimum: 1 }
                }
            },
            output: {
                success: {
                    status: 201,
                    schema: {
                        draftId: { type: "number" }
                    }
                },
                error: {
                    status: [400, 500],
                    schema: {
                        message: { type: "string" }
                    }
                }
            }
        },
        get_drafts_by_user: {
            method: "GET",
            input: {
                required: ["userId"],
                schema: {
                    userId: { type: "string", pattern: "^[0-9]+$" }
                }
            },
            output: {
                success: {
                    status: 200,
                    schema: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: ["id", "description", "creation_date", "users_id", "collections_id", "collection_name"]
                        }
                    }
                },
                error: {
                    status: [500],
                    schema: {
                        message: { type: "string" }
                    }
                }
            }
        },
        add_mold_to_draft: {
            method: "POST",
            input: {
                required: ["draftId", "moldId", "positionX", "positionY", "rotation", "scaling"],
                schema: {
                    draftId: { type: "number", minimum: 1 },
                    moldId: { type: "number", minimum: 1 },
                    positionX: { type: "number" },
                    positionY: { type: "number" },
                    rotation: { type: "number" },
                    scaling: { type: "number", minimum: 0 }
                }
            },
            output: {
                success: {
                    status: 201,
                    schema: {
                        moldDraftId: { type: "number" }
                    }
                },
                error: {
                    status: [400, 500],
                    schema: {
                        message: { type: "string" }
                    }
                }
            }
        }
    };
}

function validateNumberField(fieldName, value, schema) {
    if (typeof value !== "number") {
        throw new Error(`${fieldName} debe ser de tipo number`);
    }
    if (schema.minimum !== undefined && value < schema.minimum) {
        throw new Error(`${fieldName} debe ser mayor o igual a ${schema.minimum}`);
    }
    return true;
}

function validateArrayField(fieldName, value, schema) {
    if (!Array.isArray(value)) {
        throw new Error(`${fieldName} debe ser un array`);
    }
    
    if (schema.items) {
        value.forEach((item, index) => {
            validateObjectField(`${fieldName}[${index}]`, item, schema.items);
        });
    }
    
    return true;
}

function validateObjectField(fieldName, value, schema) {
    if (typeof value !== "object" || value === null) {
        throw new Error(`${fieldName} debe ser un objeto`);
    }
    
    if (schema.properties) {
        schema.properties.forEach((prop) => {
            if (!Object.prototype.hasOwnProperty.call(value, prop)) {
                throw new Error(`Propiedad ${prop} faltante en ${fieldName}`);
            }
        });
    }
    
    return true;
}

function validatePatternField(fieldName, value, schema) {
    if (schema.pattern) {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value.toString())) {
            throw new Error(`${fieldName} no cumple con el patrón requerido`);
        }
    }
    return true;
}

function isFieldValid(fieldName, value, schema) {
    if (value === undefined || value === null) {
        throw new Error(`${fieldName} no puede ser undefined o null`);
    }

    // Validación de tipo
    if (schema.type === "string" && typeof value !== "string") {
        throw new Error(`${fieldName} debe ser de tipo string`);
    }
    if (schema.type === "number") {
        if (typeof value !== "number") {
            throw new Error(`${fieldName} debe ser de tipo number`);
        }
        validateNumberField(fieldName, value, schema);
    }
    if (schema.type === "array") {
        return validateArrayField(fieldName, value, schema);
    }
    if (schema.type === "object") {
        return validateObjectField(fieldName, value, schema);
    }
    
    // Validación de formato email
    if (schema.format === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new Error(`${fieldName} debe ser un email válido`);
        }
    }
    
    // Validación de longitud
    if (schema.minLength && value.length < schema.minLength) {
        throw new Error(`${fieldName} debe tener al menos ${schema.minLength} caracteres`);
    }
    if (schema.maxLength && value.length > schema.maxLength) {
        throw new Error(`${fieldName} no debe exceder ${schema.maxLength} caracteres`);
    }
    
    // Validación de enum
    if (schema.enum && !schema.enum.includes(value)) {
        throw new Error(`${fieldName} debe ser uno de: ${schema.enum.join(", ")}`);
    }
    
    // Validación especial para contraseñas
    if (schema.requiresFormat && fieldName === "password") {
        const passwordErrors = isPasswordValid(value);
        if (passwordErrors.length > 0) {
            const error = new Error("Contraseña no cumple los requisitos");
            error.passwordErrors = passwordErrors;
            throw error;
        }
    }
    
    // Validación de patrón
    validatePatternField(fieldName, value, schema);
    
    return true;
}

function validateAPIInput(endpoint, req) {
    const specs = getAPISpecifications();
    const spec = specs[endpoint];

    if (!spec) {
        throw new Error(`Endpoint ${endpoint} no tiene especificación definida`);
    }
    
    if (req.method !== spec.method) {
        throw new Error(`Método HTTP inválido. Se esperaba ${spec.method}, se recibió ${req.method}`);
    }

    const data = req.method === "GET" ? req.params : req.body;

    // Validar campos requeridos
    for (const field of spec.input.required) {
        if (data[field] === undefined || data[field] === null || data[field] === "") {
            throw new Error(`Campo requerido faltante: ${field}`);
        }
    }
    
    // Validar campos según esquema de api
    for (const field in data) {
        if (spec.input.schema[field]) {
            isFieldValid(field, data[field], spec.input.schema[field]);
        }
    }

    return true;
}

function validateOutputSchema(data, schema) {
    for (const field in schema) {
        const fieldSpec = schema[field];

        if (!Object.prototype.hasOwnProperty.call(data, field)) {
            throw new Error(`Campo requerido en salida: ${field}`);
        }
        
        if (fieldSpec.type === "string" && typeof data[field] !== "string") {
            throw new Error(`${field} en salida debe ser string`);
        }
        if (fieldSpec.type === "number" && typeof data[field] !== "number") {
            throw new Error(`${field} en salida debe ser number`);
        }
        if (fieldSpec.type === "array") {
            validateArrayField(field, data[field], fieldSpec);
        }
        if (fieldSpec.type === "object") {
            validateObjectField(field, data[field], fieldSpec);
        }
    }

    return true;
}

function validateAPIOutput(endpoint, status, data) {
    const specs = getAPISpecifications();
    const spec = specs[endpoint];

    if (!spec) {
        throw new Error(`Endpoint ${endpoint} no tiene especificación definida`);
    }

    const outputSpec = status >= 200 && status < 300 
        ? spec.output.success 
        : spec.output.error;

    const expectedStatus = Array.isArray(outputSpec.status) 
        ? outputSpec.status 
        : [outputSpec.status];

    if (!expectedStatus.includes(status)) {
        throw new Error(`Status code ${status} no esperado para ${endpoint}. Esperados: ${expectedStatus.join(", ")}`);
    }

    validateOutputSchema(data, outputSpec.schema);

    return true;
}

function createInputValidator(endpoint, errorFormatter = null) {
    return function(req, res, next) {
        try {
            validateAPIInput(endpoint, req);
            next();
        } catch (error) {
            const formattedErrors = errorFormatter 
                ? errorFormatter(error) 
                : { general: error.message };
            
            return res.status(400).json({
                message: "Errores de validación",
                errors: formattedErrors
            });
        }
    };
}

function formatLoginErrors(error) {
    const fieldErrors = {};
    
    if (error.message.includes("email")) {
        fieldErrors.email = error.message;
    } else if (error.message.includes("password")) {
        fieldErrors.password = error.message;
    } else {
        fieldErrors.general = error.message;
    }
    
    return fieldErrors;
}

function formatRegisterErrors(error) {
    const fieldErrors = {};
    
    if (error.passwordErrors) {
        fieldErrors.password = error.passwordErrors;
    } else if (error.message.includes("name") || error.message.includes("username")) {
        fieldErrors.name = error.message;
    } else if (error.message.includes("email")) {
        fieldErrors.email = error.message;
    } else if (error.message.includes("password")) {
        fieldErrors.password = [error.message];
    } else {
        fieldErrors.general = error.message;
    }
    
    return fieldErrors;
}

// Middlewares de autenticación con formateo especial
export const validateLoginInput = createInputValidator("login", formatLoginErrors);
export const validateRegisterInput = createInputValidator("register", formatRegisterErrors);

// Middlewares de moldes con formateo estándar
export const validateGetAllMoldsInput = createInputValidator("get_all_molds");
export const validateGetMoldByIdInput = createInputValidator("get_mold_by_id");
export const validateCreateMoldInput = createInputValidator("create_mold");
export const validateUpdateMoldInput = createInputValidator("update_mold");
export const validateDeleteMoldInput = createInputValidator("delete_mold");

export function validateOutput(endpoint) {
    return function(req, res, next) {
        const originalSend = res.send;
        
        res.send = function(data) {
            try {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const parsedData = typeof data === "string" 
                        ? JSON.parse(data) 
                        : data;
                    validateAPIOutput(endpoint, res.statusCode, parsedData);
                }
            } catch (error) {
                console.error("Error validando salida:", error);
            }
            
            originalSend.call(this, data);
        };
        
        next();
    };
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
        "contraseña", "password", "email", "requerido",
        "caracteres", "mayúscula", "minúscula", "número",
        "especial", "inválido"
    ];

    const isValidationError = validationKeywords.some(
        keyword => err.message.toLowerCase().includes(keyword)
    );

    if (isValidationError) {
        return res.status(400).json({
            message: "Errores de validación",
            errors: { validation: err.message }
        });
    }

    // Error de JWT
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            message: "Token inválido o expirado"
        });
    }

    // Error genérico del servidor
    return res.status(500).json({
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
}

export default {
    ValidationError,
    isPasswordValid,
    getAPISpecifications,
    validateOutput,
    validateLoginInput,
    validateRegisterInput,
    validateGetAllMoldsInput,
    validateGetMoldByIdInput,
    validateCreateMoldInput,
    validateUpdateMoldInput,
    validateDeleteMoldInput,
    errorHandler
};