import LoginController from "../controllers/loginController.js";

export default class LoginViewComponent extends HTMLElement {
    constructor(modelInstance) {
        super();

        if (!modelInstance) {
            throw new Error("LoginModel instance is required");
        }

        // Composición: el controlador vive dentro de la vista
        this.innerController = new LoginController(this, modelInstance);

        this.buildUI();
    }

    buildUI() {
        this.container = document.createElement("div");
        this.container.className = "login-container";

        this.loginTitle = document.createElement("h2");
        this.loginTitle.textContent = "Login";

        this.form = document.createElement("form");

        this.inputEmail = document.createElement("input");
        this.inputEmail.type = "email";
        this.inputEmail.name = "email";
        this.inputEmail.placeholder = "Email";
        this.inputEmail.required = true;

        this.inputPassword = document.createElement("input");
        this.inputPassword.type = "password";
        this.inputPassword.name = "password";
        this.inputPassword.placeholder = "Contraseña";
        this.inputPassword.required = true;

        this.submitBtn = document.createElement("button");
        this.submitBtn.type = "submit";
        this.submitBtn.textContent = "Iniciar Sesión";

        this.messageBox = document.createElement("div");
        this.messageBox.className = "message-box";

        this.form.appendChild(this.inputEmail);
        this.form.appendChild(this.inputPassword);
        this.form.appendChild(this.submitBtn);

        this.container.appendChild(this.loginTitle);
        this.container.appendChild(this.form);
        this.container.appendChild(this.messageBox);

        this.appendChild(this.container);
    }

    connectedCallback() {
        this.boundSubmit = this.innerController.onLoginFormSubmit.bind(this.innerController);
        this.form.addEventListener("submit", this.boundSubmit);
        this.innerController.init();
    }

    disconnectedCallback() {
        this.form.removeEventListener("submit", this.boundSubmit);
        this.boundSubmit = null;
        this.innerController.release();
    }

    getEmailValue() {
        return this.inputEmail.value.trim();
    }

    getPasswordValue() {
        return this.inputPassword.value;
    }

    showMessage(message, type = "info") {
        this.messageBox.textContent = message;
        this.messageBox.className = `message-box ${type}`;
    }

    setLoading(isLoading) {
        this.submitBtn.disabled = isLoading;
        this.submitBtn.textContent = isLoading ? "Cargando..." : "Iniciar Sesión";
    }

    clearForm() {
        this.inputEmail.value = "";
        this.inputPassword.value = "";
    }
}
