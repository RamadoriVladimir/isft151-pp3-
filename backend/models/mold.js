import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Mold {
    constructor({ id = null, name, type, width = null, height = null, svg_path = null, creation_date = null, database = null }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.width = width;
        this.height = height;
        this.svg_path = svg_path;
        this.creation_date = creation_date;
        this.db = database;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            width: this.width,
            height: this.height,
            svg_path: this.svg_path,
            creation_date: this.creation_date
        };
    }

    static async saveSVGFile(svgContent) {
        try {
            const svgDir = path.join(__dirname, "../../storage/svgs");
            await fs.mkdir(svgDir, { recursive: true });

            const fileName = `mold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.svg`;
            const filePath = path.join(svgDir, fileName);

            await fs.writeFile(filePath, svgContent, "utf-8");

            return path.relative(path.join(__dirname, "../../"), filePath);
        } catch (err) {
            throw new Error(`Error guardando archivo SVG: ${err.message}`);
        }
    }

    static async deleteSVGFile(svgPath) {
        try {
            if (!svgPath) return;

            const fullPath = path.join(__dirname, "../../", svgPath);
            await fs.unlink(fullPath);
        } catch (err) {
            console.warn(`Advertencia al eliminar SVG: ${err.message}`);
        }
    }

    static validateInput(moldData) {
        if (!moldData.name) throw new Error("Name es requerido");
        if (!moldData.type) throw new Error("Type es requerido");

        return {
            name: moldData.name,
            type: moldData.type,
            width: moldData.width || null,
            height: moldData.height || null,
            svg_path: moldData.svg_path || null
        };
    }

    static async create(db, moldData) {
        const validData = this.validateInput(moldData);

        let svgPath = null;
        if (moldData.svg_content) {
            svgPath = await this.saveSVGFile(moldData.svg_content);
        }

        const moldId = await db.createMold(
            validData.name,
            validData.type,
            validData.width,
            validData.height,
            svgPath
        );
        const row = await db.getMoldById(moldId);

        return this.createInstanceFromRow(row);
    }

    static async findById(db, id) {
        const row = await db.getMoldById(id);
        if (!row) return null;
        return this.createInstanceFromRow(row);
    }

    static async findAll(db) {
        const rows = await db.getAllMolds();
        return rows.map(row => this.createInstanceFromRow(row));
    }

    static async update(db, id, updates) {
        const mold = await this.findById(db, id);
        if (!mold) throw new Error("Molde no encontrado");

        let svgPath = mold.svg_path;
        if (updates.svg_content) {
            if (mold.svg_path) {
                await this.deleteSVGFile(mold.svg_path);
            }
            svgPath = await this.saveSVGFile(updates.svg_content);
        }

        const updatedData = {
            name: updates.name || mold.name,
            type: updates.type || mold.type,
            width: updates.width !== undefined ? updates.width : mold.width,
            height: updates.height !== undefined ? updates.height : mold.height,
            svg_path: svgPath
        };

        await db.updateMold(id, updatedData);
        const row = await db.getMoldById(id);

        return this.createInstanceFromRow(row);
    }

    static async delete(db, id) {
        const mold = await this.findById(db, id);
        if (!mold) throw new Error("Molde no encontrado");

        if (mold.svg_path) {
            await this.deleteSVGFile(mold.svg_path);
        }

        await db.deleteMold(id);
        return true;
    }

    static createInstanceFromRow(row) {
        return new Mold({
            id: row.id,
            name: row.name,
            type: row.type,
            width: row.width,
            height: row.height,
            svg_path: row.svg_path,
            creation_date: row.creation_date
        });
    }
}