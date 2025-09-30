import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserFactory from "../userFactory.js";

export default class LoginHandler {
  constructor(database) {
    this.db = database;
  }

  async handleLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!this.db.db) {
        await this.db.connect();
      }

      const user = await this.validateUserData(email, password);
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

  async validateUserData(email, password) {
    const emailRegistered = await this.db.getUserByEmail(email);
    if (!emailRegistered) return null;

    const user = UserFactory.createFromDB(emailRegistered);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) return null;
    return user;
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