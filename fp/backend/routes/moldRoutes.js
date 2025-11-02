import express from "express";
import Mold from "../models/mold.js";
import conn from "../db/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
    validateGetAllMoldsInput,
    validateGetMoldByIdInput,
    validateCreateMoldInput,
    validateUpdateMoldInput,
    validateDeleteMoldInput,
    validateOutput
} from "../middleware/validationMiddleware.js";

const router = express.Router();

function addDatabaseToRequest(req, res, next) {
    req.db = conn;
    next();
}

async function getAllMoldsHandler(req, res, next) {
    try {
        const molds = await Mold.findAll(req.db);
        return res.json({
            molds: molds.map(function(m) {
                return m.toJSON();
            })
        });
    } catch (err) {
        next(err);
    }
}

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

router.use(addDatabaseToRequest);
router.use(authMiddleware);

router.get("/", validateGetAllMoldsInput, validateOutput("get_all_molds"), getAllMoldsHandler);
router.get("/:id", validateGetMoldByIdInput, validateOutput("get_mold_by_id"), getMoldByIdHandler);
router.post("/", validateCreateMoldInput, validateOutput("create_mold"), createMoldHandler);
router.put("/:id", validateUpdateMoldInput, validateOutput("update_mold"), updateMoldHandler);
router.delete("/:id", validateDeleteMoldInput, validateOutput("delete_mold"), deleteMoldHandler);

export default router;