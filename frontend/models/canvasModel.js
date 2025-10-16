export default class CanvasModel {
    constructor() {
        this.token = null;
        this.molds = [];
        this.canvasObjects = [];
        this.errorMessage = null;

        this.loadFromSession();
    }

    loadFromSession() {
        try {
            const tokenStr = sessionStorage.getItem("token");
            if (tokenStr) {
                this.token = tokenStr;
            }
        } catch (err) {
            console.error("Error loading session:", err);
        }
    }

    async getMolds() {
        try {
            const res = await fetch("http://localhost:5050/mold/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                }
            });

            if (!res.ok) {
                this.errorMessage = "Error al obtener moldes";
                return [];
            }

            const data = await res.json();
            this.molds = Array.isArray(data) ? data : [];
            return this.molds;
        } catch (err) {
            console.error("Error fetching molds:", err);
            this.errorMessage = "Error de conexión";
            return [];
        }
    }

    getCanvasObjects() {
        return this.canvasObjects;
    }

    addObjectToCanvas(moldId, x, y) {
        const mold = this.molds.find((m) => m.id == moldId);

        if (!mold) {
            console.error("Molde no encontrado");
            return;
        }

        const canvasObj = {
            id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            moldId: moldId,
            name: mold.name,
            x: x,
            y: y,
            width: mold.width || 100,
            height: mold.height || 100,
            scale: 1,
            rotation: 0,
            svgPath: mold.svg_path,
            svgData: null,
            svgImage: null
        };

        this.canvasObjects.push(canvasObj);

        if (mold.svg_path) {
            this.loadSVGImage(canvasObj);
        }
    }

    loadSVGImage(obj) {
        const img = new Image();
        img.src = `/${obj.svgPath}`;
        img.onload = () => {
            obj.svgImage = img;
        };
        img.onerror = () => {
            console.warn(`Error loading SVG: ${obj.svgPath}`);
        };
    }

    removeObjectFromCanvas(objId) {
        const index = this.canvasObjects.findIndex((o) => o.id === objId);
        if (index > -1) {
            this.canvasObjects.splice(index, 1);
        }
    }

    clearCanvas() {
        this.canvasObjects = [];
    }

    updateObjectProperty(objId, property, value) {
        const obj = this.canvasObjects.find((o) => o.id === objId);
        if (obj) {
            obj[property] = value;
        }
    }

    getError() {
        return this.errorMessage;
    }

    clearError() {
        this.errorMessage = null;
    }
}