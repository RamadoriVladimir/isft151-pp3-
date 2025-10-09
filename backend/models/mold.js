export default class Mold {
    constructor({ id = null, name, type, width = null, height = null, creation_date = null, database = null}) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.width = width;
        this.height = height;
        this.creation_date = creation_date;
        this.db = database;
    }

    static getAPISpecifications() {
        return {
            getAllMolds: {
                method: "GET",
                input: {
                    required: [],
                    schema: {}
                },
                output: {
                    success: {
                        status: 200,
                        schema: {
                            id: { type: "number" },
                            name: { type: "string" },
                            type: { type: "string" },
                            width: { type: "number", nullable: true },
                            height: { type: "number", nullable: true },
                            creation_date: { type: "string" }
                        }
                    },
                    error: {
                        status: [500],
                        schema: {
                            message: { type: "string" }
                        }
                    }
                }
            }
        };
    }

    static validateAPIInput(endpoint, req) {
        const specs = this.getAPISpecifications();
        const spec = specs[endpoint];

        if (!spec) {
            throw new Error(`Endpoint ${endpoint} no tiene especificación definida`);
        }

        if (req.method !== spec.method) {
            throw new Error(`Método HTTP inválido. Se esperaba ${spec.method}, se recibió ${req.method}`);
        }

        return true;
    }

    static validateAPIOutput(endpoint, status, data) {
        const specs = this.getAPISpecifications();
        const spec = specs[endpoint];

        if (!spec) {
            throw new Error(`Endpoint ${endpoint} no tiene especificación definida`);
        }

        let outputSpec;
        
        if (status >= 200 && status < 300) {
            outputSpec = spec.output.success;
        } else {
            outputSpec = spec.output.error;
        }

        const expectedStatus = Array.isArray(outputSpec.status) 
            ? outputSpec.status 
            : [outputSpec.status];

        if (!expectedStatus.includes(status)) {
            throw new Error(`Status code ${status} no esperado para ${endpoint}`);
        }

        return true;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            width: this.width,
            height: this.height,
            creation_date: this.creation_date,
        };
    }

    async getAllMolds(req, res) {
        try {
            Mold.validateAPIInput("getAllMolds", req);

            if (!this.db) {
                this.db = await this.db.connect();
            }
            const molds = await this.db.getAllMolds();
            Mold.validateAPIOutput("getAllMolds", 200, molds);

            return res.json(molds);
        } catch (err) {
            console.error(err);

            const errorResponse = { message: "Error al obtener los moldes" };
            Mold.validateAPIOutput("getAllMolds", 500, errorResponse);

            return res.status(500).json(errorResponse);
        }
    }
}        