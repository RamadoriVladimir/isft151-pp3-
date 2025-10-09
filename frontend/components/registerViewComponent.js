import { RegisterController } from "../controllers/registerController.js";

export default class RegisterViewComponent extends HTMLElement {
    constructor(modelInstance) {
        super();

        if (!modelInstance) {
            throw new Error("RegisterModel instance is required");
        }
        this.innerController = new RegisterController(this, modelInstance);

        this.buildUI();
    }

    buildUI() {
        this.container = document.createElement("div");
        this.container.className = "register-container";

        this.registerTitle = document.createElement("h2");
        this.registerTitle.textContent = "Registro";

        this.form = document.createElement("form");

        this.inputUsername = document.createElement("input");
        this.inputUsername.type = "text";
        this.inputUsername.name = "username";
        this.inputUsername.placeholder = "Usuario";
        this.inputUsername.required = true;

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
        this.submitBtn.textContent = "Registrarse";

        this.messageBox = document.createElement("div");
        this.messageBox.className = "message-box";

        this.form.appendChild(this.inputUsername);
        this.form.appendChild(this.inputEmail);
        this.form.appendChild(this.inputPassword);
        this.form.appendChild(this.submitBtn);

        this.container.appendChild(this.registerTitle);
        this.container.appendChild(this.form);
        this.container.appendChild(this.messageBox);

        this.appendChild(this.container);
    }

    connectedCallback() {
        this.boundSubmit = this.innerController.onRegisterFormSubmit.bind(this.innerController);
        this.form.addEventListener("submit", this.boundSubmit);

        this.innerController.init();
    }

    disconnectedCallback() {
        this.form.removeEventListener("submit", this.boundSubmit);
        this.boundSubmit = null;

        this.innerController.release();
    }

    getUsernameValue() {
        return this.inputUsername.value.trim();
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
        this.submitBtn.textContent = isLoading ? "Cargando..." : "Registrarse";
    }

    clearForm() {
        this.inputUsername.value = "";
        this.inputEmail.value = "";
        this.inputPassword.value = "";
    }
}

