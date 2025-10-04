import express from "express";
import Mold from "../models/mold.js";
import conn from "../db/db.js";

const router = express.Router();
const moldModel = new Mold(conn);

router.get("/getmolds", moldModel.getAllMolds.bind(moldModel));

export default router;