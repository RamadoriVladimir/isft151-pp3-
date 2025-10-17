import CanvasController from "../controllers/canvasController.js";

export default class CanvasViewComponent extends HTMLElement {
    constructor() {
        super();

        this.modelInstance = null;
        this.innerController = null;

        this.buildUI();
    }

    buildUI() {
        this.attachShadow({ mode: "open" });

        const container = document.createElement("div");
        container.className = "canvas-container";

        // ===== CANVAS HEADER =====
        const header = document.createElement("div");
        header.className = "canvas-header";

        const title = document.createElement("h3");
        title.textContent = "Lienzo de Diseño";

        const controls = document.createElement("div");
        controls.className = "canvas-controls";

        const zoomLabel = document.createElement("label");
        zoomLabel.textContent = "Zoom: ";

        const zoomSlider = document.createElement("input");
        zoomSlider.type = "range";
        zoomSlider.min = "50";
        zoomSlider.max = "200";
        zoomSlider.value = "100";
        zoomSlider.id = "zoomSlider";
        zoomSlider.className = "zoom-slider";

        const zoomValue = document.createElement("span");
        zoomValue.textContent = "100%";
        zoomValue.className = "zoom-value";
        zoomValue.id = "zoomValue";

        const clearBtn = document.createElement("button");
        clearBtn.textContent = "Limpiar Lienzo";
        clearBtn.className = "clear-btn";
        clearBtn.id = "clearBtn";

        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Descargar";
        downloadBtn.className = "download-btn";
        downloadBtn.id = "downloadBtn";

        controls.appendChild(zoomLabel);
        controls.appendChild(zoomSlider);
        controls.appendChild(zoomValue);
        controls.appendChild(clearBtn);
        controls.appendChild(downloadBtn);

        header.appendChild(title);
        header.appendChild(controls);

        // ===== MOLDS PALETTE =====
        const paletteSection = document.createElement("div");
        paletteSection.className = "palette-section";

        const paletteTitle = document.createElement("h4");
        paletteTitle.textContent = "Moldes Disponibles";

        const moldsPalette = document.createElement("div");
        moldsPalette.className = "molds-palette";
        moldsPalette.id = "moldsPalette";

        paletteSection.appendChild(paletteTitle);
        paletteSection.appendChild(moldsPalette);

        // ===== CANVAS AREA =====
        const canvasArea = document.createElement("div");
        canvasArea.className = "canvas-area";

        const stageWrapper = document.createElement("div");
        stageWrapper.className = "stage-wrapper";

        const corner = document.createElement("div");
        corner.className = "ruler-corner";
        corner.textContent = "";

        this.rulerTop = document.createElement("canvas");
        this.rulerTop.className = "ruler-top";
        this.rulerTop.id = "rulerTop";

        this.rulerLeft = document.createElement("canvas");
        this.rulerLeft.className = "ruler-left";
        this.rulerLeft.id = "rulerLeft";

        const canvasStage = document.createElement("div");
        canvasStage.className = "canvas-stage";

        this.canvas = document.createElement("canvas");
        this.canvas.id = "drawingCanvas";
        this.canvas.className = "drawing-canvas";

        const canvasInfo = document.createElement("div");
        canvasInfo.className = "canvas-info";
        canvasInfo.id = "canvasInfo";
        canvasInfo.textContent = "Arrastra moldes al lienzo | Click derecho para eliminar";

        canvasArea.appendChild(this.canvas);
        canvasArea.appendChild(canvasInfo);

        stageWrapper.appendChild(this.rulerTop);
        stageWrapper.appendChild(this.rulerLeft);
        stageWrapper.appendChild(canvasStage);

        canvasArea.appendChild(stageWrapper);

        // ===== PROPERTIES PANEL =====
        const propertiesPanel = document.createElement("div");
        propertiesPanel.className = "properties-panel";
        propertiesPanel.id = "propertiesPanel";

        const propertiesTitle = document.createElement("h4");
        propertiesTitle.textContent = "Propiedades del Objeto";

        const propertiesContent = document.createElement("div");
        propertiesContent.className = "properties-content";
        propertiesContent.id = "propertiesContent";

        propertiesPanel.appendChild(propertiesTitle);
        propertiesPanel.appendChild(propertiesContent);

        // ===== LAYOUT WRAPPER =====
        const mainLayout = document.createElement("div");
        mainLayout.className = "main-layout";

        mainLayout.appendChild(paletteSection);
        mainLayout.appendChild(canvasArea);
        mainLayout.appendChild(propertiesPanel);

        container.appendChild(header);
        container.appendChild(mainLayout);

        // ===== ESTILOS =====
        const style = document.createElement("style");
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            .canvas-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
            }

            .canvas-header {
                background: #fff;
                border-bottom: 1px solid #ddd;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .canvas-header h3 {
                font-size: 18px;
                color: #333;
            }

            .canvas-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .canvas-controls label {
                font-size: 13px;
                font-weight: 500;
                color: #555;
            }

            .zoom-slider {
                width: 120px;
                cursor: pointer;
            }

            .zoom-value {
                font-size: 12px;
                color: #888;
                min-width: 45px;
            }

            .clear-btn,
            .download-btn {
                padding: 6px 12px;
                border: 1px solid #ddd;
                background: #fff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }

            .clear-btn:hover {
                background: #f0f0f0;
                border-color: #999;
            }

            .download-btn {
                background: #28a745;
                color: white;
                border-color: #28a745;
            }

            .download-btn:hover {
                background: #218838;
                border-color: #218838;
            }

            .main-layout {
                display: flex;
                flex: 1;
                gap: 10px;
                padding: 10px;
                overflow: hidden;
            }

            .palette-section {
                width: 180px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 12px;
                overflow-y: auto;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .palette-section h4 {
                font-size: 12px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #eee;
            }

            .molds-palette {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .palette-item {
                padding: 8px 10px;
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: grab;
                font-size: 12px;
                color: #555;
                text-align: center;
                transition: all 0.2s ease;
                user-select: none;
            }

            .palette-item:hover {
                background: #e8f4f8;
                border-color: #007BFF;
                box-shadow: 0 2px 6px rgba(0,123,255,0.2);
            }

            .palette-item:active {
                cursor: grabbing;
            }

            .canvas-area {
                flex: 1;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .drawing-canvas {
                flex: 1;
                background: #fafafa;
                cursor: crosshair;
                border-bottom: 1px solid #eee;
            }

            .canvas-info {
                padding: 8px 12px;
                font-size: 11px;
                color: #999;
                background: #f9f9f9;
                text-align: center;
            }

            .properties-panel {
                width: 200px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 12px;
                overflow-y: auto;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .properties-panel h4 {
                font-size: 12px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #eee;
            }

            .properties-content {
                font-size: 12px;
                color: #666;
            }

            .property-item {
                margin-bottom: 10px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .property-label {
                font-weight: 500;
                color: #555;
            }

            .property-value {
                padding: 6px;
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 3px;
                color: #333;
            }

            .properties-empty {
                text-align: center;
                color: #aaa;
                padding: 20px 10px;
                font-style: italic;
            }

            /* Scrollbar styling */
            .palette-section::-webkit-scrollbar,
            .properties-panel::-webkit-scrollbar {
                width: 6px;
            }

            .palette-section::-webkit-scrollbar-track,
            .properties-panel::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }

            .palette-section::-webkit-scrollbar-thumb,
            .properties-panel::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 10px;
            }

            .palette-section::-webkit-scrollbar-thumb:hover,
            .properties-panel::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `;

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);


        this.zoomSlider = zoomSlider;
        this.zoomValue = zoomValue;
        this.clearBtn = clearBtn;
        this.downloadBtn = downloadBtn;
        this.moldsPalette = moldsPalette;
        this.propertiesContent = propertiesContent;

        this.zoomPercent = parseInt(zoomSlider.value, 10) || 100;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.leftRulerSize = 50;
        this.topRulerSize = 50; 

        this.resizeObserver = new ResizeObserver(() => {
            this.updateCanvasSizes();
            this.drawGrid();
            this.drawRulers();
        });
        this.resizeObserver.observe(this.shadowRoot.host || document.body);
    }

    connectedCallback() {
        this.checkModelAndInit();

        setTimeout(() => {
            this.updateCanvasSizes();
            this.drawGrid();
            this.drawRulers();
        }, 0);
    }

    checkModelAndInit() {
        if (this.modelInstance) {
            this.initializeController();
        } else {
            setTimeout(() => this.checkModelAndInit(), 10);
        }
    }

    initializeController() {
        this.innerController = new CanvasController(this, this.modelInstance);

        this.boundZoomChange = this.innerController.onZoomChange.bind(this.innerController);
        this.boundClear = this.innerController.onClearCanvas.bind(this.innerController);
        this.boundDownload = this.innerController.onDownload.bind(this.innerController);
        this.boundCanvasClick = this.innerController.onCanvasClick.bind(this.innerController);
        this.boundCanvasContextMenu = this.innerController.onCanvasContextMenu.bind(this.innerController);

        this.zoomSlider.addEventListener("input", this.boundZoomChange);
        this.clearBtn.addEventListener("click", this.boundClear);
        this.downloadBtn.addEventListener("click", this.boundDownload);
        this.canvas.addEventListener("click", this.boundCanvasClick);
        this.canvas.addEventListener("contextmenu", this.boundCanvasContextMenu);

        this.innerController.init();
    }

    disconnectedCallback() {
        if (this.boundZoomChange) {
            this.zoomSlider.removeEventListener("input", this.boundZoomChange);
        }
        if (this.boundClear) {
            this.clearBtn.removeEventListener("click", this.boundClear);
        }
        if (this.boundDownload) {
            this.downloadBtn.removeEventListener("click", this.boundDownload);
        }
        if (this.boundCanvasClick) {
            this.canvas.removeEventListener("click", this.boundCanvasClick);
        }
        if (this.boundCanvasContextMenu) {
            this.canvas.removeEventListener("contextmenu", this.boundCanvasContextMenu);
        }
        if (this.innerController) {
            this.innerController.release();
        }
    }

    getCanvas() {
        return this.canvas;
    }

    getCanvasContext() {
        return this.canvas.getContext("2d");
    }

    renderMoldsPalette(molds) {
        this.moldsPalette.innerHTML = "";

        if (!molds || molds.length === 0) {
            const empty = document.createElement("div");
            empty.className = "properties-empty";
            empty.textContent = "No hay moldes disponibles";
            this.moldsPalette.appendChild(empty);
            return;
        }

        molds.forEach((mold) => {
            const item = document.createElement("div");
            item.className = "palette-item";
            item.textContent = mold.name;
            item.draggable = true;

            item.addEventListener("dragstart", (e) => {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("moldId", mold.id);
            });

            this.moldsPalette.appendChild(item);
        });
    }

    setZoomValue(value) {
        let v = value;
        if (typeof v === "string") {
            v = parseInt(v.replace("%", ""), 10);
        }
        if (isNaN(v)) v = 100;
        this.zoomPercent = v;
        this.zoomValue.textContent = `${this.zoomPercent}%`;

        this.updateCanvasSizes();
        this.drawGrid();
        this.drawRulers();
    }

    showProperties(obj) {
        this.propertiesContent.innerHTML = "";

        if (!obj) {
            const empty = document.createElement("div");
            empty.className = "properties-empty";
            empty.textContent = "Selecciona un objeto";
            this.propertiesContent.appendChild(empty);
            return;
        }

        const props = [
            { label: "Nombre", value: obj.name },
            { label: "X", value: obj.x.toFixed(0) },
            { label: "Y", value: obj.y.toFixed(0) },
            { label: "Escala", value: obj.scale.toFixed(2) },
            { label: "Rotación", value: `${obj.rotation.toFixed(0)}°` }
        ];

        props.forEach((prop) => {
            const item = document.createElement("div");
            item.className = "property-item";

            const label = document.createElement("div");
            label.className = "property-label";
            label.textContent = prop.label;

            const value = document.createElement("div");
            value.className = "property-value";
            value.textContent = prop.value;

            item.appendChild(label);
            item.appendChild(value);
            this.propertiesContent.appendChild(item);
        });
    }

    clearProperties() {
        this.showProperties(null);
    }

    updateCanvasSizes() {
        const top = this.shadowRoot.querySelector(".ruler-top");
        const left = this.shadowRoot.querySelector(".ruler-left");
        const stage = this.shadowRoot.querySelector(".canvas-stage");

        if (!top || !left || !stage) return;

        const stageRect = stage.getBoundingClientRect();
        const cssWidth = Math.max(10, stageRect.width);
        const cssHeight = Math.max(10, stageRect.height - 24);

        const dpr = window.devicePixelRatio || 1;

        top.style.height = `${this.topRulerSize}px`;
        top.width = Math.max(100, Math.floor(cssWidth * dpr));
        top.height = Math.floor(this.topRulerSize * dpr);

        left.style.width = `${this.leftRulerSize}px`;
        left.width = Math.floor(this.leftRulerSize * dpr);
        left.height = Math.max(100, Math.floor(cssHeight * dpr));

        this.canvas.style.width = `${cssWidth}px`;
        this.canvas.style.height = `${cssHeight}px`;
        this.canvas.width = Math.max(100, Math.floor(cssWidth * dpr));
        this.canvas.height = Math.max(100, Math.floor(cssHeight * dpr));

        const ctx = this.canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const ctxTop = this.rulerTop.getContext("2d");
        ctxTop.setTransform(1, 0, 0, 1, 0, 0);
        ctxTop.scale(dpr, dpr);

        const ctxLeft = this.rulerLeft.getContext("2d");
        ctxLeft.setTransform(1, 0, 0, 1, 0, 0);
        ctxLeft.scale(dpr, dpr);
    }

    drawGrid() {
        const ctx = this.canvas.getContext("2d");
        const cssW = this.canvas.clientWidth;
        const cssH = this.canvas.clientHeight;

        ctx.clearRect(0, 0, cssW, cssH);

        const baseSpacing = 10;
        const spacing = (baseSpacing * this.zoomPercent) / 100;


        const minorColor = "#e9e9e9";
        const majorColor = "#d0d0d0";

        ctx.beginPath();
        for (let x = 0; x <= cssW; x += spacing) {
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, cssH);
        }
        for (let y = 0; y <= cssH; y += spacing) {
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(cssW, y + 0.5);
        }
        ctx.strokeStyle = minorColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        const majorEvery = Math.max(1, Math.round((50 * this.zoomPercent) / 100 / spacing));
        ctx.beginPath();
        for (let x = 0, i = 0; x <= cssW; x += spacing, i++) {
            if (i % majorEvery === 0) {
                ctx.moveTo(x + 0.5, 0);
                ctx.lineTo(x + 0.5, cssH);
            }
        }
        for (let y = 0, i = 0; y <= cssH; y += spacing, i++) {
            if (i % majorEvery === 0) {
                ctx.moveTo(0, y + 0.5);
                ctx.lineTo(cssW, y + 0.5);
            }
        }
        ctx.strokeStyle = majorColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();

    }

    drawRulers() {
        const top = this.rulerTop;
        const left = this.rulerLeft;
        if (!top || !left) return;

        const ctxTop = top.getContext("2d");
        const ctxLeft = left.getContext("2d");
        const cssTopH = this.topRulerSize;
        const cssLeftW = this.leftRulerSize;
        const cssW = this.canvas.clientWidth;
        const cssH = this.canvas.clientHeight;

        ctxTop.clearRect(0, 0, cssW, cssTopH);
        ctxLeft.clearRect(0, 0, cssLeftW, cssH);

        const baseSpacing = 10;
        const spacing = (baseSpacing * this.zoomPercent) / 100;

        ctxTop.fillStyle = "#f3f3f3";
        ctxTop.fillRect(0, 0, cssW, cssTopH);
        ctxLeft.fillStyle = "#f3f3f3";
        ctxLeft.fillRect(0, 0, cssLeftW, cssH);

        ctxTop.strokeStyle = "#bdbdbd";
        ctxLeft.strokeStyle = "#bdbdbd";
        ctxTop.fillStyle = "#333";
        ctxLeft.fillStyle = "#333";
        ctxTop.font = "11px Arial";
        ctxLeft.font = "11px Arial";
        ctxTop.textBaseline = "top";
        ctxLeft.textBaseline = "top";

        const majorEvery = Math.max(1, Math.round((50 * this.zoomPercent) / 100 / spacing));
        for (let x = 0, i = 0; x <= cssW; x += spacing, i++) {
            const px = Math.round(x) + 0.5;
            if (i % majorEvery === 0) {
                ctxTop.beginPath();
                ctxTop.moveTo(px, cssTopH);
                ctxTop.lineTo(px, cssTopH - 12);
                ctxTop.stroke();
                const label = `${Math.round(x)}px`;
                ctxTop.fillText(label, px + 3, 2);
            } else {
                ctxTop.beginPath();
                ctxTop.moveTo(px, cssTopH);
                ctxTop.lineTo(px, cssTopH - 6);
                ctxTop.stroke();
            }
        }

        for (let y = 0, i = 0; y <= cssH; y += spacing, i++) {
            const py = Math.round(y) + 0.5;
            if (i % majorEvery === 0) {
                ctxLeft.beginPath();
                ctxLeft.moveTo(cssLeftW, py);
                ctxLeft.lineTo(cssLeftW - 12, py);
                ctxLeft.stroke();
                const label = `${Math.round(y)}px`;
                ctxLeft.save();
                ctxLeft.translate(2, py - 6);
                ctxLeft.rotate(0);
                ctxLeft.fillText(label, 0, 0);
                ctxLeft.restore();
            } else {
                ctxLeft.beginPath();
                ctxLeft.moveTo(cssLeftW, py);
                ctxLeft.lineTo(cssLeftW - 6, py);
                ctxLeft.stroke();
            }
        }
    }  
} 