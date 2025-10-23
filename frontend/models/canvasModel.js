export default class CanvasModel {
    constructor() {
        this.token = null;
        this.molds = [];
        this.canvasObjects = [];
        this.errorMessage = null;
        this.onImageLoadCallback = null;

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

    setImageLoadCallback(callback) {
        this.onImageLoadCallback = callback;
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
            console.log("Moldes cargados:", this.molds);
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

        console.log("Agregando molde al canvas:", mold);

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
            console.log("SVG path original:", mold.svg_path);
            this.loadSVGImage(canvasObj);
        } else {
            console.warn("El molde no tiene svg_path");
        }
    }

    loadSVGImage(obj) {
        // Normalizar la ruta: reemplazar barras invertidas por barras normales
        const normalizedPath = obj.svgPath.replace(/\\/g, '/');
        console.log("Ruta normalizada:", normalizedPath);

        const img = new Image();
        img.crossOrigin = "anonymous";
        
        // Intentar con la ruta correcta
        const imagePath = `http://localhost:5050/${normalizedPath}`;
        console.log("Cargando imagen desde:", imagePath);
        
        img.src = imagePath;
        img.onload = this.handleSVGImageLoad.bind(this, obj, img);
        img.onerror = this.handleSVGImageError.bind(this, obj, img, normalizedPath);
    }

    handleSVGImageLoad(obj, img) {
        obj.svgImage = img;
        console.log("✓ SVG cargado correctamente:", obj.name, "Dimensiones:", img.width, "x", img.height);
        
        if (this.onImageLoadCallback) {
            this.onImageLoadCallback();
        }
    }

    handleSVGImageError(obj, img, normalizedPath) {
        console.error("✗ Error cargando SVG:", normalizedPath);
        
        // Intentar cargar como blob inline
        this.loadSVGAsInline(obj, normalizedPath);
    }

    async loadSVGAsInline(obj, normalizedPath) {
        try {
            console.log("Intentando cargar SVG como contenido inline");
            const response = await fetch(`http://localhost:5050/${normalizedPath}`);
            
            if (!response.ok) {
                console.error("No se pudo cargar el contenido SVG. Status:", response.status);
                return;
            }

            const svgText = await response.text();
            const blob = new Blob([svgText], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const img = new Image();
            img.onload = this.handleSVGImageLoad.bind(this, obj, img);
            img.onerror = function() {
                console.error("Error cargando SVG inline");
            };
            img.src = url;
        } catch (err) {
            console.error("Error en loadSVGAsInline:", err);
        }
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