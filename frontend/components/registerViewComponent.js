import { RegisterController } from "../controllers/registerController.js";

export default class RegisterViewComponent extends HTMLElement {
    constructor() {
        super();

        this.modelInstance = null;
        this.innerController = null;

        this.buildUI();
    }

    buildUI() {
        this.attachShadow({ mode: "open" });

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

        this.loginContainer = document.createElement("div");
        this.loginContainer.className = "login-container-link";

        this.loginLink = document.createElement("a");
        this.loginLink.href = "/auth/login";
        this.loginLink.textContent = "¿Ya tenes una cuenta? Inicia sesión";

        this.loginContainer.appendChild(this.loginLink);

        this.form.appendChild(this.inputUsername);
        this.form.appendChild(this.inputEmail);
        this.form.appendChild(this.inputPassword);
        this.form.appendChild(this.submitBtn);

        this.container.appendChild(this.registerTitle);
        this.container.appendChild(this.form);
        this.container.appendChild(this.loginContainer);
        this.container.appendChild(this.messageBox);

        this.appendChild(this.container);

        const style = document.createElement("style");
        style.textContent = `
            .register-container {
                width: 300px;
                margin: 50px auto;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 10px;
                background: #f9f9f9;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .register-container h2 {
                text-align: center;
                margin-bottom: 20px;
            }
            .register-container form {
                display: flex;
                flex-direction: column;
            }
            .register-container input {
                padding: 10px;
                margin: 8px 0;
                border: 1px solid #aaa;
                border-radius: 5px;
                font-size: 14px;
            }
            .register-container button {
                padding: 10px;
                margin-top: 12px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            .register-container button:hover {
                background: #218838;
            }
            .message-box {
                margin-top: 15px;
                font-size: 14px;
                text-align: center;
                color: red;
            }
            .login-container-link {
                margin-top: 15px;
                text-align: center;
            }
            .login-container-link a {
                color: #007BFF;
                text-decoration: none;
                font-size: 14px;
            }
            .login-container-link a:hover {
                text-decoration: underline;
            }
        `;

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this.container);
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
        this.innerController = new RegisterController(this, this.modelInstance);

        this.boundSubmit = this.innerController.onRegisterFormSubmit.bind(this.innerController);
        this.form.addEventListener("submit", this.boundSubmit);
        this.innerController.init();
    }

    disconnectedCallback() {
        if (this.boundSubmit) {
            this.form.removeEventListener("submit", this.boundSubmit);
            this.boundSubmit = null;
        }
        if (this.innerController) {
            this.innerController.release();
        }
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