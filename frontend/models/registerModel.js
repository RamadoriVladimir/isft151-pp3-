export class RegisterModel {
    constructor() {
        this.successMessage = null;
        this.errorMessage = null;
    }

    async registerUser(username, email, password) {
        try {
            const res = await fetch("http://localhost:5050/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (!res.ok) {
                const err = await res.json();
                this.errorMessage = err.message || "Error en registro";
                return false;
            }

            const data = await res.json();
            this.successMessage = data.message;
            this.errorMessage = null;
            return true;
        } catch (err) {
            this.errorMessage = "Error de conexión";
            return false;
        }
    }

    getSuccessMessage() {
        return this.successMessage;
    }

    getError() {
        return this.errorMessage;
    }

    clearMessages() {
        this.successMessage = null;
        this.errorMessage = null;
    }
}