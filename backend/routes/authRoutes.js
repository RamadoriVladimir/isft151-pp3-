import express from "express";
import { RegisterHandler } from "../handlers/registerHandler.js";
import LoginHandler from "../handlers/loginHandler.js";
import conn from "../db/db.js";

const router = express.Router();

const loginHandler = new LoginHandler(conn);
const registerHandler = new RegisterHandler(conn);

router.post("/register", registerHandler.validateRegister.bind(registerHandler));
router.post("/login", loginHandler.handleLogin.bind(loginHandler));

export default router;
