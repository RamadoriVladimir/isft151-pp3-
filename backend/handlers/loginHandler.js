import jwt from "jsonwebtoken";

export default class LoginHandler {
    constructor(database, userModel) {
        this.db = database;
        this.userModel = userModel;
    }

    async handleLogin(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await this.userModel.validateUserData(
                { email, password },
                this.db
            );

            const token = this.generateToken(user);

            return res.json({
                message: "Login exitoso",
                token,
                user: user.toJSON()
            });

        } catch (err) {
            next(err);
        }
    }

    generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );
    }
}