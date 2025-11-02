export class RegisterModel {
    constructor() {
        this.successMessage = null;
        this.errorMessage = null;
        this.fieldErrors = {};
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
                this.fieldErrors = err.errors || {};
                return false;
            }

            const data = await res.json();
            this.successMessage = data.message;
            this.errorMessage = null;
            this.fieldErrors = {};
            return true;
        } catch (err) {
            this.errorMessage = "Error de conexión";
            this.fieldErrors = {};
            return false;
        }
    }

    getSuccessMessage() {
        return this.successMessage;
    }

    getError() {
        return this.errorMessage;
    }

    getFieldErrors() {
        return this.fieldErrors;
    }

    clearMessages() {
        this.successMessage = null;
        this.errorMessage = null;
        this.fieldErrors = {};
    }
}