import express from "express";
import { RegisterHandler } from "../handlers/registerHandler.js";
import LoginHandler from "../handlers/loginHandler.js";
import conn from "../db/db.js";
import AuthPageController from "../controllers/AuthPageController.js";

const router = express.Router();

const loginHandler = new LoginHandler(conn);
const registerHandler = new RegisterHandler(conn);

const pageController = new AuthPageController();

// ✅ Rutas de vistas SIN funciones anónimas
router.get("/login", pageController.serveLogin.bind(pageController));
router.get("/register", pageController.serveRegister.bind(pageController));

// ✅ Rutas de API
router.post("/register", registerHandler.validateRegister.bind(registerHandler));
router.post("/login", loginHandler.handleLogin.bind(loginHandler));

export default router;