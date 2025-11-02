import WebSocketService from "../services/websocketService.js";

export default class CanvasModel {
    constructor() {
        this.token = null;
        this.molds = [];
        this.canvasObjects = [];
        this.errorMessage = null;
        this.onImageLoadCallback = null;
        this.wsService = new WebSocketService();
        this.onCanvasUpdateCallback = null;

        this.loadFromSession();
        this.setupWebSocket();
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

    setupWebSocket() {
        if (!this.token) return;

        this.wsService.connect(this.token);

        this.wsService.on("connected", this.handleWSConnected.bind(this));
        this.wsService.on("canvas_object_added", this.handleCanvasObjectAdded.bind(this));
        this.wsService.on("canvas_object_moved", this.handleCanvasObjectMoved.bind(this));
        this.wsService.on("canvas_object_removed", this.handleCanvasObjectRemoved.bind(this));
        this.wsService.on("canvas_cleared", this.handleCanvasCleared.bind(this));
    }

    setOnCanvasUpdateCallback(callback) {
        this.onCanvasUpdateCallback = callback;
    }

    handleWSConnected(data) {
        console.log("✓ Canvas conectado al sistema colaborativo");
    }

    handleCanvasObjectAdded(data) {
        if (data.userId === this.getUserId()) return;

        console.log("Otro usuario agregó un objeto al canvas:", data.object.name);

        const exists = this.canvasObjects.find(function(obj) {
            return obj.id === data.object.id;
        });

        if (!exists) {
            this.canvasObjects.push(data.object);
            
            if (data.object.svgPath) {
                this.loadSVGImage(data.object);
            }

            if (this.onCanvasUpdateCallback) {
                this.onCanvasUpdateCallback("object_added", data.object);
            }
        }
    }

    handleCanvasObjectMoved(data) {
        if (data.userId === this.getUserId()) return;

        const obj = this.canvasObjects.find(function(o) {
            return o.id === data.objectId;
        });

        if (obj) {
            obj.x = data.x;
            obj.y = data.y;
            obj.rotation = data.rotation;
            obj.scale = data.scale;

            if (this.onCanvasUpdateCallback) {
                this.onCanvasUpdateCallback("object_moved", obj);
            }
        }
    }

    handleCanvasObjectRemoved(data) {
        if (data.userId === this.getUserId()) return;

        console.log("Otro usuario eliminó un objeto del canvas");

        const index = this.canvasObjects.findIndex(function(obj) {
            return obj.id === data.objectId;
        });

        if (index > -1) {
            this.canvasObjects.splice(index, 1);

            if (this.onCanvasUpdateCallback) {
                this.onCanvasUpdateCallback("object_removed", { id: data.objectId });
            }
        }
    }

    handleCanvasCleared(data) {
        if (data.userId === this.getUserId()) return;

        console.log(`Otro usuario (${data.email}) limpió el canvas`);

        this.canvasObjects = [];

        if (this.onCanvasUpdateCallback) {
            this.onCanvasUpdateCallback("canvas_cleared", {});
        }
    }

    getUserId() {
        try {
            const userDataStr = sessionStorage.getItem("userData");
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                return userData.id;
            }
        } catch (err) {
            console.error("Error getting user ID:", err);
        }
        return null;
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
            this.molds = Array.isArray(data) ? data : (data.molds || []);
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
        const mold = this.molds.find(function(m) {
            return m.id == moldId;
        });

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

        this.wsService.notifyCanvasObjectAdded(canvasObj);
    }

    loadSVGImage(obj) {
        const normalizedPath = obj.svgPath.replace(/\\/g, '/');
        console.log("Ruta normalizada:", normalizedPath);

        const img = new Image();
        img.crossOrigin = "anonymous";
        
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
        const index = this.canvasObjects.findIndex(function(o) {
            return o.id === objId;
        });

        if (index > -1) {
            this.canvasObjects.splice(index, 1);
            this.wsService.notifyCanvasObjectRemoved(objId);
        }
    }

    clearCanvas() {
        this.canvasObjects = [];
        this.wsService.notifyCanvasCleared();
    }

    updateObjectProperty(objId, property, value) {
        const obj = this.canvasObjects.find(function(o) {
            return o.id === objId;
        });

        if (obj) {
            obj[property] = value;
        }
    }

    notifyObjectMoved(objId) {
        const obj = this.canvasObjects.find(function(o) {
            return o.id === objId;
        });

        if (obj) {
            this.wsService.notifyCanvasObjectMoved(
                obj.id,
                obj.x,
                obj.y,
                obj.rotation,
                obj.scale
            );
        }
    }

    getError() {
        return this.errorMessage;
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