import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.startsWith("Bearer ") 
            ? authHeader.slice(7) 
            : authHeader;

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

        req.userId = decoded.id;
        req.userEmail = decoded.email;

        next();
    } catch (err) {
        console.error("Error en autenticación:", err.message);
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
}

export default authMiddleware;