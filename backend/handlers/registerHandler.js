export class RegisterHandler {
  constructor(database) {
    this.db = database;
  }

  async validateRegister(req, res) {
    const { email, password } = req.body;
    try {
      if (!this.db.db) {
        await this.db.connect();
      }

      const emailExists = await this.db.getUserByEmail(email);

      if (emailExists) {
        return res.status(400).json({ message: "El email ya esta registrado" });
      }

      this.checkPasswordStrength(password);

      await this.db.insertUserToDB(req.body);

      return res.status(201).json({ message: "Usuario registrado con exito" });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message || "Error registrando usuario" });
    }
  }
  
  checkPasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new Error(`La contraseña debe tener al menos ${minLength} caracteres`);
    }
    if (!hasUpperCase) {
      throw new Error("La contraseña debe contener al menos una letra mayuscula");
    }
    if (!hasLowerCase) {
      throw new Error("La contraseña debe contener al menos una letra minuscula");
    }
    if (!hasNumbers) {
      throw new Error("La contraseña debe contener al menos un numero");
    }
    if (!hasSpecialChars) {
      throw new Error("La contraseña debe contener al menos un caracter especial");
    }
    return true;
  }
}
