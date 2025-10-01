import express from "express";
import MoldHandler from "../handlers/moldHandler.js";
import conn from "../db/db.js";

const router = express.Router();
const moldHandler = new MoldHandler(conn);

router.get("/getmolds", moldHandler.getAllMolds.bind(moldHandler));

export default router;