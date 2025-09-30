import path from "path";
import { fileURLToPath } from "url";

export default class AuthController {
  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    this.__dirname = path.dirname(__filename);
  }

  serveLogin(req, res) {
    res.sendFile(path.join(this.__dirname, "../frontend/login.html"));
  }

  serveRegister(req, res) {
    res.sendFile(path.join(this.__dirname, "../frontend/register.html"));
  }
}