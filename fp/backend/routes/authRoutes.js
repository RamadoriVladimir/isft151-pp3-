import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import conn from "../db/db.js";
import { 
    validateLoginInput, 
    validateRegisterInput,
    validateOutput
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(function(req, res, next) {
    req.db = conn;
    next();
});

async function handleRegister(req, res, next) {
    try {
        const { username, name, email, password } = req.body;

        const userData = {
            name: username || name,
            email,
            password,
            role: "user"
        };

        const emailExists = await User.checkEmailExists(userData, req.db);

        if (emailExists) {
            return res.status(400).json({
                message: "El email ya está registrado",
                errors: { email: "Este email ya está en uso" }
            });
        }

        await User.create(req.db, userData);

        return res.status(201).json({
            message: "Usuario registrado con éxito"
        });

    } catch (err) {
        console.error("Error en registro:", err);
        
        if (err.message && err.message.includes("contraseña")) {
            return res.status(400).json({
                message: "Error de validación",
                errors: { password: [err.message] }
            });
        }
        
        next(err);
    }
}

async function handleLogin(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await User.validateUserData(
            { email, password },
            req.db
        );

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );

        return res.json({
            message: "Login exitoso",
            token,
            user: user.toJSON()
        });

    } catch (err) {
        console.error("Error en login:", err);
        
        if (err.message === "Credenciales inválidas") {
            return res.status(401).json({
                message: "Email o contraseña incorrectos",
                errors: { general: "Las credenciales proporcionadas no son válidas" }
            });
        }
        
        next(err);
    }
}

router.post(
    "/register",
    validateRegisterInput,
    validateOutput("register"),
    handleRegister
);

router.post(
    "/login",
    validateLoginInput,
    validateOutput("login"),
    handleLogin
);

export default router;