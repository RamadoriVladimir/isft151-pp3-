export default class MoldHandler {
    constructor(database) {
        this.db = database;
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