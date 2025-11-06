import apiConfig from "../config/apiConfig.js";

export default class LoginModel {
    constructor() {
        this.userData = null;
        this.token = null;
        this.errorMessage = null;
        this.fieldErrors = {};
    }

    async authenticate(email, password) {
        try {
            const res = await apiConfig.fetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const err = await res.json();
                this.errorMessage = err.message || "Error en login";
                this.fieldErrors = err.errors || {};
                return false;
            }

            const data = await res.json();
            this.userData = data.user;
            this.token = data.token;
            this.errorMessage = null;
            this.fieldErrors = {};
            return true;
        } catch (err) {
            this.errorMessage = "Error de conexión";
            this.fieldErrors = {};
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

    getFieldErrors() {
        return this.fieldErrors;
    }

    clearData() {
        this.userData = null;
        this.token = null;
        this.errorMessage = null;
        this.fieldErrors = {};
    }
}