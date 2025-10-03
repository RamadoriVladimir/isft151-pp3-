export class RegisterHandler {
    constructor(database, user) {
        this.db = database;
        this.model = user;
    }

    async validateRegister(req, res) {
        const { name, email, password, role } = req.body;
        try {
            if (!email || !password) {
                throw new Error("Email y password son requeridos");
            } 

            let emailExists = this.model.checkEmailExists(email, this.db);
            if (emailExists) {
                return res.status(400).json({ message: "El email ya esta registrado" });
            }

            const userData = {
                name:req.body.username || name,
                email,
                password,
                role: role || "user",
            }

            const tempUser = new this.model({ ...userData });
            tempUser.checkPasswordStrength(password);

            await this.model.create(this.db, userData);

            return res.status(201).json({ message: "Usuario registrado con exito" });
        } catch (err) {
            console.error(err);
            return res.status(400).json({ message: err.message || "Error registrando usuario" });
        }
    }
}