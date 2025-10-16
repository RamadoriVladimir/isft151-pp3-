export default class DashboardModel {
    constructor() {
        this.userData = null;
        this.molds = [];
        this.errorMessage = null;
        this.token = null;

        this.loadFromSession();
    }

    loadFromSession() {
        try {
            const userDataStr = sessionStorage.getItem("userData");
            const tokenStr = sessionStorage.getItem("token");

            if (userDataStr && tokenStr) {
                this.userData = JSON.parse(userDataStr);
                this.token = tokenStr;
            } else {
                this.redirectToLogin();
            }
        } catch (err) {
            console.error("Error loading session:", err);
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        window.location.href = "/auth/login";
    }

    getUserData() {
        return this.userData;
    }

    getMolds() {
        return this.molds;
    }

    getError() {
        return this.errorMessage;
    }

    async fetchMolds() {
        try {
            const res = await fetch("http://localhost:5050/mold/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    this.redirectToLogin();
                    return false;
                }
                const err = await res.json();
                this.errorMessage = err.message || "Error al obtener moldes";
                return false;
            }

            const data = await res.json();
            this.molds = Array.isArray(data) ? data : [];
            this.errorMessage = null;
            return true;
        } catch (err) {
            console.error("Error fetching molds:", err);
            this.errorMessage = "Error de conexión al servidor";
            return false;
        }
    }

    async uploadMold(name, type, width, height, svgFile) {
        try {
            let svgContent = "";

            try {
                svgContent = await svgFile.text();
            } catch (err) {
                this.errorMessage = "Error al leer el archivo SVG";
                return false;
            }

            const moldData = {
                name,
                type,
                width,
                height,
                svg_content: svgContent
            };

            const res = await fetch("http://localhost:5050/mold/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify(moldData)
            });

            if (!res.ok) {
                if (res.status === 401) {
                    this.redirectToLogin();
                    return false;
                }
                const err = await res.json();
                this.errorMessage = err.message || "Error al crear molde";
                return false;
            }

            const data = await res.json();
            this.errorMessage = null;
            return true;
        } catch (err) {
            console.error("Error uploading mold:", err);
            this.errorMessage = "Error de conexión al servidor";
            return false;
        }
    }

    async deleteMold(moldId) {
        try {
            const res = await fetch(`http://localhost:5050/mold/${moldId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    this.redirectToLogin();
                    return false;
                }
                const err = await res.json();
                this.errorMessage = err.message || "Error al eliminar molde";
                return false;
            }

            this.errorMessage = null;
            return true;
        } catch (err) {
            console.error("Error deleting mold:", err);
            this.errorMessage = "Error de conexión al servidor";
            return false;
        }
    }

    logout() {
        sessionStorage.removeItem("userData");
        sessionStorage.removeItem("token");
        this.userData = null;
        this.token = null;
        this.molds = [];
    }

    clearError() {
        this.errorMessage = null;
    }
}