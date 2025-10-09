import jwt from "jsonwebtoken";

export default class LoginHandler {
    constructor(database, user) {
        this.db = database;
        this.model = user;
    }

    async handleLogin(req, res) {
        try {
            this.model.validateAPIInput("login", req);

            const { email, password } = req.body;
            const userData = {
                email,
                password
            };
            const user = await this.model.validateUserData(userData, this.db);

            if (!user) {
                const errorResponse = { message: "Credenciales invalidas" };
                this.model.validateAPIOutput("login", 401, errorResponse);

                return res.status(401).json(errorResponse);
            }

            const token = this.generateToken(user);
            const successResponse = this.returnLoginJson(user, token);
            this.model.validateAPIOutput("login", 200, successResponse);

            return res.json(successResponse);
        } catch (err) {
            console.error(err);
            const errorResponse = { message: err.message || "Error en login" };
            this.model.validateAPIOutput("login", 500, errorResponse);

            return res.status(500).json(errorResponse);
        }
    }

    generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );
    }

    returnLoginJson(user, token) {
        return {
            message: "Login exitoso",
            token,
            user: user.toJSON(),
        };
    }
}