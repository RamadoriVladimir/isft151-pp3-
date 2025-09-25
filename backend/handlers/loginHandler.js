import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import conn from "../db/db.js";
import UserFactory from "../userFactory.js";

export default class LoginHandler {
  static async handleLogin(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!conn.userDBcollection) {
        await conn.connect();
      }

      const user = await LoginHandler.validateUserData(email, password);
      if (!user) {
        return res.status(401).json({ message: "Credenciales invalidas" });
      }

      const token = LoginHandler.generateToken(user);
      console.log("Usuario logueado:", user.email);
      return res.json(LoginHandler.returnLoginJson(user, token));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error en login" });
    }
  }

  static async validateUserData(email, password) {
    const emailRegistered = await conn.userDBcollection.findOne({ email });
    if (!emailRegistered) return null;

    const user = UserFactory.createFromDB(emailRegistered);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) return null;
    return user;
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
  }

  static returnLoginJson(user, token) {
    return {
      message: "Login exitoso",
      token,
      user: user.toJSON(),
    };
  }
}
