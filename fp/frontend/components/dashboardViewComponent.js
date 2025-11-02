import DashboardController from "../controllers/dashboardController.js";
import CanvasViewComponent from "./canvasViewComponent.js";
import CanvasModel from "../models/canvasModel.js";

export default class DashboardViewComponent extends HTMLElement {
    constructor() {
        super();

        this.modelInstance = null;
        this.innerController = null;
        this.canvasModel = null;

        this.buildUI();
    }

    buildUI() {
        this.attachShadow({ mode: "open" });

        const container = document.createElement("div");
        container.className = "dashboard-container";

        // ===== HEADER =====
        const header = document.createElement("header");
        header.className = "header";

        const titleH1 = document.createElement("h1");
        titleH1.textContent = "Gestor de Moldes";

        const userInfoDiv = document.createElement("div");
        userInfoDiv.className = "user-info";

        const userNameSpan = document.createElement("span");
        userNameSpan.className = "user-name";
        userNameSpan.id = "userNameSpan";

        const logoutBtn = document.createElement("button");
        logoutBtn.className = "logout-btn";
        logoutBtn.textContent = "Cerrar Sesión";
        logoutBtn.id = "logoutBtn";

        userInfoDiv.appendChild(userNameSpan);
        userInfoDiv.appendChild(logoutBtn);

        header.appendChild(titleH1);
        header.appendChild(userInfoDiv);

        // ===== MAIN CONTENT =====
        const mainContent = document.createElement("main");
        mainContent.className = "main-content";

        // ===== UPLOAD SECTION =====
        const uploadSection = document.createElement("section");
        uploadSection.className = "upload-section";

        const uploadTitle = document.createElement("h2");
        uploadTitle.textContent = "Crear Nuevo Molde";

        const uploadForm = document.createElement("form");
        uploadForm.className = "upload-form";
        uploadForm.id = "uploadForm";

        const moldNameInput = document.createElement("input");
        moldNameInput.type = "text";
        moldNameInput.placeholder = "Nombre del molde";
        moldNameInput.required = true;
        moldNameInput.id = "moldNameInput";

        const moldTypeSelect = document.createElement("select");
        moldTypeSelect.required = true;
        moldTypeSelect.id = "moldTypeSelect";

        const typeOption1 = document.createElement("option");
        typeOption1.value = "";
        typeOption1.textContent = "Selecciona un tipo";
        typeOption1.disabled = true;
        typeOption1.selected = true;

        const typeOption2 = document.createElement("option");
        typeOption2.value = "shape";
        typeOption2.textContent = "Forma";

        const typeOption3 = document.createElement("option");
        typeOption3.value = "pattern";
        typeOption3.textContent = "Patrón";

        const typeOption4 = document.createElement("option");
        typeOption4.value = "custom";
        typeOption4.textContent = "Personalizado";

        moldTypeSelect.appendChild(typeOption1);
        moldTypeSelect.appendChild(typeOption2);
        moldTypeSelect.appendChild(typeOption3);
        moldTypeSelect.appendChild(typeOption4);

        const moldWidthInput = document.createElement("input");
        moldWidthInput.type = "number";
        moldWidthInput.placeholder = "Ancho (px)";
        moldWidthInput.min = "1";
        moldWidthInput.id = "moldWidthInput";

        const moldHeightInput = document.createElement("input");
        moldHeightInput.type = "number";
        moldHeightInput.placeholder = "Alto (px)";
        moldHeightInput.min = "1";
        moldHeightInput.id = "moldHeightInput";

        const svgFileInput = document.createElement("input");
        svgFileInput.type = "file";
        svgFileInput.accept = ".svg";
        svgFileInput.required = true;
        svgFileInput.id = "svgFileInput";

        const svgFileLabel = document.createElement("label");
        svgFileLabel.className = "file-label";
        svgFileLabel.textContent = "Selecciona archivo SVG";
        svgFileLabel.id = "svgFileLabel";
        svgFileLabel.htmlFor = "svgFileInput";

        const svgPreview = document.createElement("div");
        svgPreview.className = "svg-preview";
        svgPreview.id = "svgPreview";

        const uploadBtn = document.createElement("button");
        uploadBtn.type = "submit";
        uploadBtn.className = "upload-btn";
        uploadBtn.textContent = "Subir Molde";
        uploadBtn.id = "uploadBtn";

        uploadForm.appendChild(moldNameInput);
        uploadForm.appendChild(moldTypeSelect);
        uploadForm.appendChild(moldWidthInput);
        uploadForm.appendChild(moldHeightInput);
        uploadForm.appendChild(svgFileInput);
        uploadForm.appendChild(svgFileLabel);
        uploadForm.appendChild(svgPreview);
        uploadForm.appendChild(uploadBtn);

        uploadSection.appendChild(uploadTitle);
        uploadSection.appendChild(uploadForm);

        // ===== MESSAGE BOX =====
        const messageBox = document.createElement("div");
        messageBox.className = "message-box";
        messageBox.id = "messageBox";

        // ===== MOLDS SECTION =====
        const moldsSection = document.createElement("section");
        moldsSection.className = "molds-section";

        const moldsTitle = document.createElement("h2");
        moldsTitle.textContent = "Mis Moldes";

        const moldsList = document.createElement("div");
        moldsList.className = "molds-list";
        moldsList.id = "moldsList";

        moldsSection.appendChild(moldsTitle);
        moldsSection.appendChild(moldsList);

        // ===== CANVAS SECTION =====
        const canvasSection = document.createElement("section");
        canvasSection.className = "canvas-section";
        canvasSection.id = "canvasSection";

        mainContent.appendChild(uploadSection);
        mainContent.appendChild(messageBox);
        mainContent.appendChild(moldsSection);
        mainContent.appendChild(canvasSection);

        container.appendChild(header);
        container.appendChild(mainContent);

        // ===== ESTILOS =====
        const style = document.createElement("style");
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            .dashboard-container {
                min-height: 100vh;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
            }

            .header {
                background: #007BFF;
                color: white;
                padding: 20px 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .header h1 {
                font-size: 28px;
            }

            .user-info {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .user-name {
                font-size: 14px;
            }

            .logout-btn {
                padding: 8px 16px;
                background: #ff6b6b;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }

            .logout-btn:hover {
                background: #ee5a52;
            }

            .main-content {
                padding: 40px;
                max-width: 1400px;
                margin: 0 auto;
                width: 100%;
                flex: 1;
                overflow-y: auto;
            }

            .upload-section {
                background: white;
                padding: 30px;
                border-radius: 10px;
                margin-bottom: 30px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .upload-section h2 {
                margin-bottom: 20px;
                color: #333;
            }

            .upload-form {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                align-items: end;
            }

            .upload-form input,
            .upload-form select {
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            }

            .upload-form input:focus,
            .upload-form select:focus {
                outline: none;
                border-color: #007BFF;
                box-shadow: 0 0 5px rgba(0,123,255,0.3);
            }

            .upload-form input[type="file"] {
                display: none;
            }

            .file-label {
                padding: 10px;
                background: #e9ecef;
                border: 2px dashed #007BFF;
                border-radius: 5px;
                text-align: center;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }

            .file-label:hover {
                background: #dee2e6;
            }

            .file-label.active {
                background: #d1ecf1;
                border-color: #17a2b8;
            }

            .svg-preview {
                grid-column: 1 / -1;
                max-height: 200px;
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 5px;
                display: none;
                align-items: center;
                justify-content: center;
                overflow: auto;
            }

            .svg-preview.active {
                display: flex;
            }

            .svg-preview svg,
            .svg-preview img {
                max-width: 100%;
                max-height: 100%;
            }

            .upload-btn {
                grid-column: 1 / -1;
                padding: 12px 20px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            }

            .upload-btn:hover {
                background: #218838;
            }

            .upload-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            .message-box {
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                display: none;
                font-size: 14px;
            }

            .message-box.active {
                display: block;
            }

            .message-box.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }

            .message-box.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }

            .message-box.info {
                background: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }

            .molds-section {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin-bottom: 30px;
            }

            .molds-section h2 {
                margin-bottom: 20px;
                color: #333;
            }

            .molds-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
            }

            .mold-card {
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }

            .mold-card:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateY(-2px);
            }

            .mold-preview {
                width: 100%;
                height: 150px;
                background: #f0f0f0;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .mold-preview svg,
            .mold-preview img {
                max-width: 90%;
                max-height: 90%;
            }

            .mold-info {
                flex-grow: 1;
            }

            .mold-name {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 5px;
                color: #333;
            }

            .mold-type {
                font-size: 12px;
                color: #666;
                margin-bottom: 3px;
            }

            .mold-dimensions {
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
            }

            .mold-actions {
                display: flex;
                gap: 8px;
            }

            .mold-btn {
                flex: 1;
                padding: 8px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
            }

            .mold-edit {
                background: #007BFF;
                color: white;
            }

            .mold-edit:hover {
                background: #0056b3;
            }

            .mold-delete {
                background: #dc3545;
                color: white;
            }

            .mold-delete:hover {
                background: #c82333;
            }

            .empty-message {
                text-align: center;
                color: #999;
                padding: 40px 20px;
                font-size: 16px;
            }

            .loading {
                text-align: center;
                padding: 20px;
                color: #666;
            }

            .canvas-section {
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin-bottom: 30px;
                height: 650px;
                overflow: hidden;
            }
        `;

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);

        this.uploadForm = uploadForm;
        this.svgFileInput = svgFileInput;
        this.svgFileLabel = svgFileLabel;
        this.svgPreview = svgPreview;
        this.moldNameInput = moldNameInput;
        this.moldTypeSelect = moldTypeSelect;
        this.moldWidthInput = moldWidthInput;
        this.moldHeightInput = moldHeightInput;
        this.uploadBtn = uploadBtn;
        this.logoutBtn = logoutBtn;
        this.userNameSpan = userNameSpan;
        this.messageBox = messageBox;
        this.moldsList = moldsList;
        this.canvasSection = canvasSection;
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
        this.innerController = new DashboardController(this, this.modelInstance);

        this.boundFormSubmit = this.innerController.onUploadFormSubmit.bind(this.innerController);
        this.boundFileChange = this.handleFileChange.bind(this);
        this.boundLogout = this.innerController.onLogout.bind(this.innerController);

        this.uploadForm.addEventListener("submit", this.boundFormSubmit);
        this.svgFileInput.addEventListener("change", this.boundFileChange);
        this.logoutBtn.addEventListener("click", this.boundLogout);

        this.innerController.init();
        this.initializeCanvas();
    }

    initializeCanvas() {
        if (!this.canvasSection) return;

        this.canvasModel = new CanvasModel();
        this.canvasModel.molds = this.modelInstance.getMolds();
        
        const canvasView = document.createElement("canvas-view");
        canvasView.modelInstance = this.canvasModel;

        this.canvasSection.innerHTML = "";
        this.canvasSection.appendChild(canvasView);
        
        console.log("Canvas inicializado con", this.canvasModel.molds.length, "moldes");
    }

    updateCanvasMolds() {
        if (this.canvasModel) {
            this.canvasModel.molds = this.modelInstance.getMolds();
            console.log("Moldes actualizados en canvas:", this.canvasModel.molds.length);
            
            // Buscar el componente canvas-view y actualizar su paleta
            const canvasView = this.canvasSection.querySelector("canvas-view");
            if (canvasView && canvasView.innerController) {
                canvasView.innerController.loadMolds();
            }
        }
    }

    disconnectedCallback() {
        if (this.boundSubmit) {
            this.uploadForm.removeEventListener("submit", this.boundFormSubmit);
            this.boundFormSubmit = null;
        }
        if (this.boundFileChange) {
            this.svgFileInput.removeEventListener("change", this.boundFileChange);
            this.boundFileChange = null;
        }
        if (this.boundLogout) {
            this.logoutBtn.removeEventListener("click", this.boundLogout);
            this.boundLogout = null;
        }
        if (this.innerController) {
            this.innerController.release();
        }
    }

    getMoldName() {
        return this.moldNameInput.value.trim();
    }

    getMoldType() {
        return this.moldTypeSelect.value;
    }

    getMoldWidth() {
        const val = this.moldWidthInput.value;
        return val ? parseInt(val) : null;
    }

    getMoldHeight() {
        const val = this.moldHeightInput.value;
        return val ? parseInt(val) : null;
    }

    getSVGFile() {
        return this.svgFileInput.files[0] || null;
    }

    handleFileChange(event) {
        const file = this.svgFileInput.files[0];

        if (file) {
            this.svgFileLabel.classList.add("active");
            this.svgFileLabel.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.svgPreview.innerHTML = e.target.result;
                this.svgPreview.classList.add("active");
            };
            reader.readAsText(file);
        } else {
            this.svgFileLabel.classList.remove("active");
            this.svgFileLabel.textContent = "Selecciona archivo SVG";
            this.svgPreview.innerHTML = "";
            this.svgPreview.classList.remove("active");
        }
    }

    setUserName(name) {
        this.userNameSpan.textContent = `Bienvenido, ${name}`;
    }

    showMessage(message, type = "info") {
        this.messageBox.textContent = message;
        this.messageBox.className = `message-box active ${type}`;
    }

    setLoading(isLoading) {
        this.uploadBtn.disabled = isLoading;
        this.uploadBtn.textContent = isLoading ? "Subiendo..." : "Subir Molde";
    }

    clearForm() {
        this.moldNameInput.value = "";
        this.moldTypeSelect.value = "";
        this.moldWidthInput.value = "";
        this.moldHeightInput.value = "";
        this.svgFileInput.value = "";
        this.svgFileLabel.classList.remove("active");
        this.svgFileLabel.textContent = "Selecciona archivo SVG";
        this.svgPreview.innerHTML = "";
        this.svgPreview.classList.remove("active");
    }

    renderMoldsList(molds) {
        this.moldsList.innerHTML = "";

        if (!molds || molds.length === 0) {
            this.moldsList.innerHTML = '<div class="empty-message">No hay moldes cargados. ¡Crea el primero!</div>';
            return;
        }

        molds.forEach((mold) => {
            const card = document.createElement("div");
            card.className = "mold-card";

            const preview = document.createElement("div");
            preview.className = "mold-preview";

            if (mold.svg_path) {
                const img = document.createElement("img");
                img.src = `/${mold.svg_path}`;
                img.alt = mold.name;
                preview.appendChild(img);
            } else {
                preview.textContent = "Sin vista previa";
            }

            const info = document.createElement("div");
            info.className = "mold-info";

            const name = document.createElement("div");
            name.className = "mold-name";
            name.textContent = mold.name;

            const type = document.createElement("div");
            type.className = "mold-type";
            type.textContent = `Tipo: ${mold.type}`;

            const dimensions = document.createElement("div");
            dimensions.className = "mold-dimensions";
            dimensions.textContent = `${mold.width || "—"} x ${mold.height || "—"} px`;

            info.appendChild(name);
            info.appendChild(type);
            info.appendChild(dimensions);

            const actions = document.createElement("div");
            actions.className = "mold-actions";

            const editBtn = document.createElement("button");
            editBtn.className = "mold-btn mold-edit";
            editBtn.textContent = "Editar";
            editBtn.addEventListener("click", () => {
                this.innerController.onEditMold(mold.id);
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "mold-btn mold-delete";
            deleteBtn.textContent = "Eliminar";
            deleteBtn.addEventListener("click", () => {
                if (confirm(`¿Estás seguro de que deseas eliminar "${mold.name}"?`)) {
                    this.innerController.onDeleteMold(mold.id);
                }
            });

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            card.appendChild(preview);
            card.appendChild(info);
            card.appendChild(actions);

            this.moldsList.appendChild(card);
        });
    }

    showLoading() {
        this.moldsList.textContent = "";

        const loadingDiv = document.createElement("div");
        loadingDiv.classList.add("loading");
        loadingDiv.textContent = "Cargando moldes...";

        this.moldsList.appendChild(loadingDiv);
    }
}