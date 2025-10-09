export default class LoginModel {
    constructor() {
        this.userData = null;
        this.token = null;
        this.errorMessage = null;
    }

    async authenticate(email, password) {
        try {
            const res = await fetch("http://localhost:5050/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const err = await res.json();
                this.errorMessage = err.message || "Error en login";
                return false;
            }

            const data = await res.json();
            this.userData = data.user;
            this.token = data.token;
            this.errorMessage = null;
            return true;
        } catch (err) {
            this.errorMessage = "Error de conexión";
            return false;
        }
    }

    getUserData() {
        return this.userData;
    }

    getToken() {
        return this.token;
    }

    getError() {
        return this.errorMessage;
    }

    clearData() {
        this.userData = null;
        this.token = null;
        this.errorMessage = null;
    }
}