import conn from "../db/db.js";

export default class RegisterHandler {
  static async validateRegister(req, res,) {
    const { email, password } = req.body;
    try {
      if (!conn.userDBcollection) {
        await conn.connect();
      }
      const emailExists = await conn.userDBcollection.findOne({ email });

      if (emailExists) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }

      RegisterHandler.checkPasswordStrength(password);

      await conn.insertUserToDB(req.body);

      return res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message || "Error registrando usuario" });
    }
  }
  
  static checkPasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new Error(`La contraseña debe tener al menos ${minLength} caracteres`);
    }
    if (!hasUpperCase) {
      throw new Error("La contraseña debe contener al menos una letra mayúscula");
    }
    if (!hasLowerCase) {
      throw new Error("La contraseña debe contener al menos una letra minúscula");
    }
    if (!hasNumbers) {
      throw new Error("La contraseña debe contener al menos un número");
    }
    if (!hasSpecialChars) {
      throw new Error("La contraseña debe contener al menos un carácter especial");
    }
    return true;
  }
}
