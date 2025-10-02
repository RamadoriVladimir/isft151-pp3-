export default class User {
    constructor({ id = null, name, email, password, role = null, creation_date = null }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.creation_date = creation_date;
    }

    toJSON() {
        return {
        id: this.id,
        name: this.name,
        email: this.email,
        role: this.role,
        creation_date: this.creation_date,
        };
    }
}