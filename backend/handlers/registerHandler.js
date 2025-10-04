export class RegisterHandler {
    constructor(database, user) {
        this.db = database;
        this.model = user;
    }

    async validateRegister(req, res) {
        const { name, email, password, role } = req.body;
        try {
            const userData = {
                name: req.body.username || name,
                email,
                password,
                role: role || "user",
            }

            const validatedData = this.model.validateInput(userData);
            let emailExists = await this.model.checkEmailExists(userData, this.db);

            if (emailExists) {
                return res.status(400).json({ message: "El email ya está registrado" });
            }

            await this.model.create(this.db, validatedData);

            return res.status(201).json({ message: "Usuario registrado con éxito" });
        } catch (err) {
            console.error(err);
            return res.status(400).json({ message: err.message || "Error registrando usuario" });
        }
    }
}