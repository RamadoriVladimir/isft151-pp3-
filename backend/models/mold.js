export default class Mold {
    constructor({ id = null, name, description, creation_date = null, database = null}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.creation_date = creation_date;
        this.db = database;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            creation_date: this.creation_date,
        };
    }

    async getAllMolds(req, res) {
        if (!this.db) {
            this.db = await this.db.connect();
        }
        try {
            const molds = await this.db.getAllMolds();
            return res.json(molds);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error al obtener los moldes" });
        }
    }
}        