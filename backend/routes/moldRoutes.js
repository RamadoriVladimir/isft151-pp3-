import express from "express";
import Mold from "../models/mold.js";
import conn from "../db/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateMoldInput } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use((req, res, next) => {
    req.db = conn;
    next();
});

router.use(authMiddleware);

router.get("/", async (req, res, next) => {
    try {
        const molds = await Mold.findAll(req.db);
        return res.json(molds.map(m => m.toJSON()));
    } catch (err) {
        next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const mold = await Mold.findById(req.db, id);

        if (!mold) {
            return res.status(404).json({
                message: "Molde no encontrado"
            });
        }

        return res.json(mold.toJSON());
    } catch (err) {
        next(err);
    }
});

router.post("/", validateMoldInput, async (req, res, next) => {
    try {
        const mold = await Mold.create(req.db, req.body);

        return res.status(201).json({
            message: "Molde creado exitosamente",
            mold: mold.toJSON()
        });
    } catch (err) {
        next(err);
    }
});

router.put("/:id", validateMoldInput, async (req, res, next) => {
    try {
        const { id } = req.params;
        const mold = await Mold.update(req.db, id, req.body);

        return res.json({
            message: "Molde actualizado exitosamente",
            mold: mold.toJSON()
        });
    } catch (err) {
        next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        await Mold.delete(req.db, id);

        return res.json({
            message: "Molde eliminado exitosamente"
        });
    } catch (err) {
        next(err);
    }
});

export default router;