export class ValidationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "ValidationError";
        this.details = details;
    }
}

export function validateLoginInput(req, res, next) {
    const { email, password } = req.body;
    const errors = {};

    if (!email) {
        errors.email = "Email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Email inválido";
    }

    if (!password) {
        errors.password = "Password es requerido";
    } else if (password.length < 1) {
        errors.password = "Password inválido";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Errores de validación",
            errors
        });
    }

    next();
}

export function validateRegisterInput(req, res, next) {
    const { username, name, email, password } = req.body;
    const errors = {};

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
    } else if (password.length < 8) {
        errors.password = "Password debe tener al menos 8 caracteres";
    } else if (!/[A-Z]/.test(password)) {
        errors.password = "Password debe contener una mayúscula";
    } else if (!/[a-z]/.test(password)) {
        errors.password = "Password debe contener una minúscula";
    } else if (!/\d/.test(password)) {
        errors.password = "Password debe contener un número";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.password = "Password debe contener un carácter especial";
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