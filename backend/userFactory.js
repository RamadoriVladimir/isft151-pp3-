import User from "./models/user.js";

export default class UserFactory {
    static createFromRequest(reqBody, hashedPassword) {
        const name = reqBody.username || reqBody.name;
        
        if (!name) {
        throw new Error("Username o name es requerido");
        }
        
        if (!reqBody.email) {
        throw new Error("Email es requerido");
        }

        return new User({
        name: name,
        email: reqBody.email,
        password: hashedPassword,
        role: reqBody.role || 'user',
        });
    }

    static createFromDB(row) {
        return new User({
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.pass_hash,
        role: row.role,
        creation_date: row.creation_date,
        });
    }
}