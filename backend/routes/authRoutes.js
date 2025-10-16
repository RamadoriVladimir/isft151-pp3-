import express from "express";
import { RegisterHandler } from "../handlers/registerHandler.js";
import LoginHandler from "../handlers/loginHandler.js";
import conn from "../db/db.js";
import User from "../models/user.js";
import { 
    validateLoginInput, 
    validateRegisterInput 
} from "../middleware/validationMiddleware.js";

const router = express.Router();

const loginHandler = new LoginHandler(conn, User);
const registerHandler = new RegisterHandler(conn, User);

router.post(
    "/register",
    validateRegisterInput,
    registerHandler.validateRegister.bind(registerHandler)
);

router.post(
    "/login",
    validateLoginInput,
    loginHandler.handleLogin.bind(loginHandler)
);

export default router;