import conn from "../db/db.js";

export default class RegisterHandler {
  static async validateRegister(req, res) {
    const { email } = req.body;

    try {
      if (!conn.userDBcollection) {
        await conn.connect();
      }
      const emailExists = await conn.userDBcollection.findOne({ email });

      if (emailExists) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }
      await conn.insertUserToDB(req.body);

      return res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error registrando usuario" });
    }
  }
}
