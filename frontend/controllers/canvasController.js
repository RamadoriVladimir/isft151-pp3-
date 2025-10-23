export default class CanvasController {
    constructor(viewInstance, modelInstance) {
        this.view = viewInstance;
        this.model = modelInstance;

        this.ctx = null;
        this.canvas = null;
        this.zoom = 100;
        this.selectedObject = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    init() {
        console.log("CanvasController initialized");

        this.canvas = this.view.getCanvas();
        this.ctx = this.view.getCanvasContext();

        this.model.setImageLoadCallback(this.handleImageLoaded.bind(this));

        this.setupCanvas();
        this.loadMolds();
        this.setupCanvasInteraction();
    }

    release() {
        console.log("CanvasController released");
    }

    handleImageLoaded() {
        console.log("Imagen cargada, redibujando canvas");
        this.redraw();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight - 30;

        console.log("Canvas configurado:", this.canvas.width, "x", this.canvas.height);

        window.addEventListener("resize", this.handleWindowResize.bind(this));
    }

    handleWindowResize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight - 30;
        this.redraw();
    }

    async loadMolds() {
        console.log("Cargando moldes en canvas...");
        console.log("Moldes disponibles en modelo:", this.model.molds.length);
        
        // Si ya hay moldes en el modelo, usarlos directamente
        if (this.model.molds.length > 0) {
            this.view.renderMoldsPalette(this.model.molds);
            console.log("Moldes renderizados en paleta:", this.model.molds.length);
        } else {
            // Si no hay moldes, intentar cargarlos desde el servidor
            const molds = await this.model.getMolds();
            this.view.renderMoldsPalette(molds);
            console.log("Moldes cargados desde servidor:", molds.length);
        }
    }

    setupCanvasInteraction() {
        this.canvas.addEventListener("dragover", this.handleDragOver.bind(this));
        this.canvas.addEventListener("drop", this.handleDrop.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    }

    handleDrop(e) {
        e.preventDefault();

        const moldId = e.dataTransfer.getData("moldId");
        if (!moldId) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        console.log("Drop en posición:", x, y, "Molde ID:", moldId);

        this.model.addObjectToCanvas(moldId, x, y);
        this.redraw();
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        const obj = this.getObjectAtPos(pos.x, pos.y);

        if (obj) {
            this.selectedObject = obj;
            this.isDragging = true;
            this.dragOffset.x = pos.x - obj.x;
            this.dragOffset.y = pos.y - obj.y;
            this.view.showProperties(obj);
        }

        this.redraw();
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);

        if (this.isDragging && this.selectedObject) {
            this.selectedObject.x = pos.x - this.dragOffset.x;
            this.selectedObject.y = pos.y - this.dragOffset.y;
            this.view.showProperties(this.selectedObject);
            this.redraw();
            return;
        }

        const obj = this.getObjectAtPos(pos.x, pos.y);
        this.canvas.style.cursor = obj ? "grab" : "crosshair";
    }

    handleMouseUp(e) {
        this.isDragging = false;
    }

    handleMouseLeave(e) {
        this.isDragging = false;
    }

    onCanvasClick(e) {
        const pos = this.getMousePos(e);
        const obj = this.getObjectAtPos(pos.x, pos.y);

        if (obj) {
            this.selectedObject = obj;
            this.view.showProperties(obj);
        } else {
            this.selectedObject = null;
            this.view.clearProperties();
        }

        this.redraw();
    }

    onCanvasContextMenu(e) {
        e.preventDefault();

        const pos = this.getMousePos(e);
        const obj = this.getObjectAtPos(pos.x, pos.y);

        if (obj) {
            console.log("Eliminando objeto:", obj.name);
            this.model.removeObjectFromCanvas(obj.id);
            this.selectedObject = null;
            this.view.clearProperties();
            this.redraw();
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    getObjectAtPos(x, y) {
        const objects = this.model.getCanvasObjects();

        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            const w = obj.width * obj.scale;
            const h = obj.height * obj.scale;

            if (x >= obj.x && x <= obj.x + w && y >= obj.y && y <= obj.y + h) {
                return obj;
            }
        }

        return null;
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();

        const objects = this.model.getCanvasObjects();
        console.log("Redibujando", objects.length, "objetos");

        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            this.drawObject(obj, obj === this.selectedObject);
        }

        this.ctx.restore();
    }

    drawObject(obj, isSelected) {
        this.ctx.save();

        this.ctx.translate(obj.x + (obj.width * obj.scale) / 2, obj.y + (obj.height * obj.scale) / 2);
        this.ctx.rotate((obj.rotation * Math.PI) / 180);
        this.ctx.scale(obj.scale, obj.scale);

        if (obj.svgImage) {
            this.drawSVG(obj, -obj.width / 2, -obj.height / 2);
        } else {
            this.drawPlaceholder(obj, -obj.width / 2, -obj.height / 2);
        }

        if (isSelected) {
            this.drawSelectionBox(obj, -obj.width / 2, -obj.height / 2);
        }

        this.ctx.restore();
    }

    drawSVG(obj, x, y) {
        if (!obj.svgImage) return;

        try {
            this.ctx.drawImage(obj.svgImage, x, y, obj.width, obj.height);
        } catch (err) {
            console.error("Error dibujando SVG:", err);
            this.drawPlaceholder(obj, x, y);
        }
    }

    drawPlaceholder(obj, x, y) {
        this.ctx.fillStyle = "#e8f4f8";
        this.ctx.fillRect(x, y, obj.width, obj.height);

        this.ctx.strokeStyle = "#007BFF";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, obj.width, obj.height);

        this.ctx.fillStyle = "#007BFF";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(obj.name, x + obj.width / 2, y + obj.height / 2);
    }

    drawSelectionBox(obj, x, y) {
        this.ctx.strokeStyle = "#ff6b6b";
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(x - 2, y - 2, obj.width + 4, obj.height + 4);
        this.ctx.setLineDash([]);

        const handleSize = 6;
        this.ctx.fillStyle = "#ff6b6b";
        this.ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(x + obj.width - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(x - handleSize / 2, y + obj.height - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(
            x + obj.width - handleSize / 2,
            y + obj.height - handleSize / 2,
            handleSize,
            handleSize
        );
    }

    onZoomChange(e) {
        this.zoom = parseInt(e.target.value);
        this.view.setZoomValue(this.zoom);
        this.redraw();
    }

    onClearCanvas(e) {
        if (confirm("¿Estás seguro de que deseas limpiar todo el lienzo?")) {
            this.model.clearCanvas();
            this.selectedObject = null;
            this.view.clearProperties();
            this.redraw();
        }
    }

    onDownload(e) {
        const link = document.createElement("a");
        link.href = this.canvas.toDataURL("image/png");
        link.download = "lienzo-moldes.png";
        link.click();
    }
}