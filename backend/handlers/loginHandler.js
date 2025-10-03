import jwt from "jsonwebtoken";

export default class LoginHandler {
    constructor(database, user) {
        this.db = database;
        this.model = user;
    }

    async handleLogin(req, res) {
        const { email, password } = req.body;
        try {
            if (!this.db.db) {
                await this.db.connect();
            }

            const userData = {
                email,
                password
            };

            const user = await this.model.validateUserData(userData, this.db);
            if (!user) {
                return res.status(401).json({ message: "Credenciales invalidas" });
            }

            const token = this.generateToken(user);
            console.log("Usuario logueado:", user.email);
            
            return res.json(this.returnLoginJson(user, token));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error en login" });
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