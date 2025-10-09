export class RegisterHandler {
    constructor(database, user) {
        this.db = database;
        this.model = user;
    }

    async validateRegister(req, res) {
        try {
            this.model.validateAPIInput("register", req);

            const { name, email, password, role } = req.body;
            const userData = {
                name: req.body.username || name,
                email,
                password,
                role: role || "user",
            };
            const validatedData = this.model.validateInput(userData);
            const emailExists = await this.model.checkEmailExists(userData, this.db);

            if (emailExists) {
                const errorResponse = { message: "El email ya está registrado" };
                this.model.validateAPIOutput("register", 400, errorResponse);
                
                return res.status(400).json(errorResponse);
            }

            await this.model.create(this.db, validatedData);
            const successResponse = { message: "Usuario registrado con éxito" };

            this.model.validateAPIOutput("register", 201, successResponse);
            return res.status(201).json(successResponse);
        } catch (err) {
            console.error(err);
            const errorResponse = { message: err.message || "Error registrando usuario" };
            this.model.validateAPIOutput("register", 400, errorResponse);

            return res.status(400).json(errorResponse);
        }
    }
}