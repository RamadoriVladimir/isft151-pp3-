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

        this.canvas = document.createElement("canvas");
        this.canvas.id = "drawingCanvas";
        this.canvas.className = "drawing-canvas";

        const canvasInfo = document.createElement("div");
        canvasInfo.className = "canvas-info";
        canvasInfo.id = "canvasInfo";
        canvasInfo.textContent = "Arrastra moldes al lienzo | Click derecho para eliminar";

        canvasArea.appendChild(this.canvas);
        canvasArea.appendChild(canvasInfo);

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

        // Guardar referencias
        this.zoomSlider = zoomSlider;
        this.zoomValue = zoomValue;
        this.clearBtn = clearBtn;
        this.downloadBtn = downloadBtn;
        this.moldsPalette = moldsPalette;
        this.propertiesContent = propertiesContent;
    }

    connectedCallback() {
        this.checkModelAndInit();
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
        this.zoomValue.textContent = `${value}%`;
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
}