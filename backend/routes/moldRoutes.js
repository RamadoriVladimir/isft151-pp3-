import express from "express";
import Mold from "../models/mold.js";
import conn from "../db/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateMoldInput } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Middleware para agregar la conexión a la base de datos a todas las rutas
function addDatabaseToRequest(req, res, next) {
    req.db = conn;
    next();
}

// Handler para obtener todos los moldes
async function getAllMoldsHandler(req, res, next) {
    try {
        const molds = await Mold.findAll(req.db);
        return res.json(molds.map(function(m) {
            return m.toJSON();
        }));
    } catch (err) {
        next(err);
    }
}

// Handler para obtener un molde por ID
async function getMoldByIdHandler(req, res, next) {
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
}

// Handler para crear un nuevo molde
async function createMoldHandler(req, res, next) {
    try {
        const mold = await Mold.create(req.db, req.body);

        return res.status(201).json({
            message: "Molde creado exitosamente",
            mold: mold.toJSON()
        });
    } catch (err) {
        next(err);
    }
}

// Handler para actualizar un molde
async function updateMoldHandler(req, res, next) {
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
}

// Handler para eliminar un molde
async function deleteMoldHandler(req, res, next) {
    try {
        const { id } = req.params;
        await Mold.delete(req.db, id);

        return res.json({
            message: "Molde eliminado exitosamente"
        });
    } catch (err) {
        next(err);
    }
}

// Configuración de rutas
router.use(addDatabaseToRequest);
router.use(authMiddleware);

router.get("/", getAllMoldsHandler);
router.get("/:id", getMoldByIdHandler);
router.post("/", validateMoldInput, createMoldHandler);
router.put("/:id", validateMoldInput, updateMoldHandler);
router.delete("/:id", deleteMoldHandler);

export default router;