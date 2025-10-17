
export class RegisterHandler {
    constructor(database, userModel) {
        this.db = database;
        this.userModel = userModel;
    }

    async validateRegister(req, res, next) {
        try {
            const { username, name, email, password } = req.body;

            const userData = {
                name: username || name,
                email,
                password,
                role: "user"
            };

            const emailExists = await this.userModel.checkEmailExists(
                userData,
                this.db
            );

            if (emailExists) {
                return res.status(400).json({
                    message: "El email ya está registrado",
                    errors: { email: "Este email ya está en uso" }
                });
            }

            await this.userModel.create(this.db, userData);

            return res.status(201).json({
                message: "Usuario registrado con éxito"
            });

        } catch (err) {
            next(err);
        }
    }
}