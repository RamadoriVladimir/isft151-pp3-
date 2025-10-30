import WebSocketService from "../services/websocketService.js";

export default class DashboardModel {
    constructor() {
        this.userData = null;
        this.molds = [];
        this.errorMessage = null;
        this.token = null;
        this.wsService = new WebSocketService();
        this.onMoldsUpdateCallback = null;

        this.loadFromSession();
        this.setupWebSocket();
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

    setupWebSocket() {
        if (!this.token) return;

        this.wsService.connect(this.token);

        this.wsService.on("connected", this.handleWSConnected.bind(this));
        this.wsService.on("disconnected", this.handleWSDisconnected.bind(this));
        this.wsService.on("mold_created", this.handleMoldCreated.bind(this));
        this.wsService.on("mold_updated", this.handleMoldUpdated.bind(this));
        this.wsService.on("mold_deleted", this.handleMoldDeleted.bind(this));
        this.wsService.on("user_joined", this.handleUserJoined.bind(this));
        this.wsService.on("user_left", this.handleUserLeft.bind(this));
    }

    setOnMoldsUpdateCallback(callback) {
        this.onMoldsUpdateCallback = callback;
    }

    handleWSConnected(data) {
        console.log("✓ Conectado al sistema colaborativo");
    }

    handleWSDisconnected(data) {
        console.log("✗ Desconectado del sistema colaborativo");
    }

    handleMoldCreated(data) {
        console.log("Otro usuario creó un molde:", data.mold.name, "por", data.email);
        
        const exists = this.molds.find(function(m) {
            return m.id === data.mold.id;
        });

        if (!exists) {
            this.molds.push(data.mold);
            
            if (this.onMoldsUpdateCallback) {
                this.onMoldsUpdateCallback("created", data.mold, data.email);
            }
        }
    }

    handleMoldUpdated(data) {
        console.log("Otro usuario actualizó un molde:", data.mold.name, "por", data.email);
        
        const index = this.molds.findIndex(function(m) {
            return m.id === data.mold.id;
        });

        if (index > -1) {
            this.molds[index] = data.mold;
            
            if (this.onMoldsUpdateCallback) {
                this.onMoldsUpdateCallback("updated", data.mold, data.email);
            }
        }
    }

    handleMoldDeleted(data) {
        console.log("Otro usuario eliminó un molde:", data.moldId, "por", data.email);
        
        const index = this.molds.findIndex(function(m) {
            return m.id === data.moldId;
        });

        if (index > -1) {
            this.molds.splice(index, 1);
            
            if (this.onMoldsUpdateCallback) {
                this.onMoldsUpdateCallback("deleted", { id: data.moldId }, data.email);
            }
        }
    }

    handleUserJoined(data) {
        console.log(`👤 ${data.email} se unió a la sesión colaborativa`);
    }

    handleUserLeft(data) {
        console.log(`👤 ${data.email} dejó la sesión colaborativa`);
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

    getWebSocketService() {
        return this.wsService;
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
            
            if (data.mold) {
                this.molds.push(data.mold);
                this.wsService.notifyMoldCreated(data.mold);
            }

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

            const index = this.molds.findIndex(function(m) {
                return m.id === moldId;
            });

            if (index > -1) {
                this.molds.splice(index, 1);
            }

            this.wsService.notifyMoldDeleted(moldId);

            this.errorMessage = null;
            return true;
        } catch (err) {
            console.error("Error deleting mold:", err);
            this.errorMessage = "Error de conexión al servidor";
            return false;
        }
    }

    logout() {
        this.wsService.disconnect();
        
        sessionStorage.removeItem("userData");
        sessionStorage.removeItem("token");
        this.userData = null;
        this.token = null;
        this.molds = [];
    }

    clearError() {
        this.errorMessage = null;
    }

    destroy() {
        if (this.wsService) {
            this.wsService.disconnect();
        }
    }
}