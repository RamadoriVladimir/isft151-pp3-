import express from "express";
import RegisterHandler from "../handlers/registerHandler.js";
import LoginHandler from "../handlers/loginHandler.js";

const router = express.Router();

router.post("/register", RegisterHandler.validateRegister);
router.post("/login", LoginHandler.handleLogin);

export default router;
