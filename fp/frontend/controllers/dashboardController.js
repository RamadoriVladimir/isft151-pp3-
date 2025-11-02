export default class DashboardController {
    constructor(viewInstance, modelInstance) {
        this.view = viewInstance;
        this.model = modelInstance;
    }

    init() {
        console.log("DashboardController initialized");
        this.loadUserData();
        this.loadMolds();
        this.setupCollaborativeCallbacks();
    }

    release() {
        console.log("DashboardController released");
        if (this.model) {
            this.model.destroy();
        }
    }

    setupCollaborativeCallbacks() {
        this.model.setOnMoldsUpdateCallback(this.handleCollaborativeUpdate.bind(this));
    }

    handleCollaborativeUpdate(action, mold, userEmail) {
        switch (action) {
            case "created":
                this.view.showMessage(
                    `${userEmail} agregó un nuevo molde: ${mold.name}`,
                    "info"
                );
                this.refreshMoldsList();
                this.view.updateCanvasMolds();
                break;
                
            case "updated":
                this.view.showMessage(
                    `${userEmail} actualizó el molde: ${mold.name}`,
                    "info"
                );
                this.refreshMoldsList();
                this.view.updateCanvasMolds();
                break;
                
            case "deleted":
                this.view.showMessage(
                    `${userEmail} eliminó un molde`,
                    "info"
                );
                this.refreshMoldsList();
                this.view.updateCanvasMolds();
                break;
        }
    }

    refreshMoldsList() {
        const molds = this.model.getMolds();
        this.view.renderMoldsList(molds);
    }

    loadUserData() {
        const userData = this.model.getUserData();
        if (userData) {
            this.view.setUserName(userData.name);
        }
    }

    async loadMolds() {
        this.view.showLoading();
        const success = await this.model.fetchMolds();

        if (success) {
            const molds = this.model.getMolds();
            this.view.renderMoldsList(molds);
            this.view.updateCanvasMolds();
        } else {
            const error = this.model.getError();
            this.view.showMessage(error || "Error al cargar moldes", "error");
        }
    }

    async onUploadFormSubmit(event) {
        event.preventDefault();

        const name = this.view.getMoldName();
        const type = this.view.getMoldType();
        const width = this.view.getMoldWidth();
        const height = this.view.getMoldHeight();
        const svgFile = this.view.getSVGFile();

        if (!name || !type || !svgFile) {
            this.view.showMessage("Por favor completa los campos requeridos", "error");
            return;
        }

        this.view.setLoading(true);

        const success = await this.model.uploadMold(name, type, width, height, svgFile);

        this.view.setLoading(false);

        if (success) {
            this.view.showMessage("Molde creado exitosamente", "success");
            this.view.clearForm();
            this.refreshMoldsList();
            this.view.updateCanvasMolds();
        } else {
            const error = this.model.getError();
            this.view.showMessage(error || "Error al crear molde", "error");
        }
    }

    async onEditMold(moldId) {
        console.log("Edit mold:", moldId);
        this.view.showMessage("Funcionalidad de edición en desarrollo", "info");
    }

    async onDeleteMold(moldId) {
        const success = await this.model.deleteMold(moldId);

        if (success) {
            this.view.showMessage("Molde eliminado exitosamente", "success");
            this.refreshMoldsList();
            this.view.updateCanvasMolds();
        } else {
            const error = this.model.getError();
            this.view.showMessage(error || "Error al eliminar molde", "error");
        }
    }

    onLogout() {
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            this.model.logout();
            window.location.href = "/auth/login";
        }
    }
}