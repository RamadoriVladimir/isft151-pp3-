import express from "express";
import { RegisterHandler } from "../handlers/registerHandler.js";
import LoginHandler from "../handlers/loginHandler.js";
import conn from "../db/db.js";
import User from "../models/user.js";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const loginHandler = new LoginHandler(conn, User);
const registerHandler = new RegisterHandler(conn, User);

function serveRegister(req, res) {
    res.sendFile(path.join(__dirname, "../../frontend/register.html"));
}

function serveLogin(req, res) {
    res.sendFile(path.join(__dirname, "../../frontend/login.html"));
}

router.get("/register", serveRegister);
router.get("/login", serveLogin);

router.post("/register", registerHandler.validateRegister.bind(registerHandler));
router.post("/login", loginHandler.handleLogin.bind(loginHandler));

export default router;