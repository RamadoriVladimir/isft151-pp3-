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

        this.usernameWrapper = document.createElement("div");
        this.usernameWrapper.className = "input-wrapper";
        this.inputUsername = document.createElement("input");
        this.inputUsername.type = "text";
        this.inputUsername.name = "username";
        this.inputUsername.placeholder = "Usuario";
        this.inputUsername.required = true;
        this.usernameError = document.createElement("span");
        this.usernameError.className = "error-message";
        this.usernameWrapper.appendChild(this.inputUsername);
        this.usernameWrapper.appendChild(this.usernameError);

        this.emailWrapper = document.createElement("div");
        this.emailWrapper.className = "input-wrapper";
        this.inputEmail = document.createElement("input");
        this.inputEmail.type = "email";
        this.inputEmail.name = "email";
        this.inputEmail.placeholder = "Email";
        this.inputEmail.required = true;
        this.emailError = document.createElement("span");
        this.emailError.className = "error-message";
        this.emailWrapper.appendChild(this.inputEmail);
        this.emailWrapper.appendChild(this.emailError);

        this.passwordWrapper = document.createElement("div");
        this.passwordWrapper.className = "input-wrapper";
        this.inputPassword = document.createElement("input");
        this.inputPassword.type = "password";
        this.inputPassword.name = "password";
        this.inputPassword.placeholder = "Contraseña";
        this.inputPassword.required = true;
        this.passwordError = document.createElement("div");
        this.passwordError.className = "error-message password-errors";
        this.passwordWrapper.appendChild(this.inputPassword);
        this.passwordWrapper.appendChild(this.passwordError);

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

        this.form.appendChild(this.usernameWrapper);
        this.form.appendChild(this.emailWrapper);
        this.form.appendChild(this.passwordWrapper);
        this.form.appendChild(this.submitBtn);

        this.container.appendChild(this.registerTitle);
        this.container.appendChild(this.form);
        this.container.appendChild(this.messageBox);
        this.container.appendChild(this.loginContainer);

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
            .input-wrapper {
                display: flex;
                flex-direction: column;
                margin: 8px 0;
            }
            .register-container input {
                padding: 10px;
                border: 1px solid #aaa;
                border-radius: 5px;
                font-size: 14px;
            }
            .register-container input:focus {
                outline: none;
                border-color: #007BFF;
                box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
            }
            .error-message {
                color: #dc3545;
                font-size: 12px;
                margin-top: 3px;
                display: none;
            }
            .error-message.show {
                display: block;
            }
            .password-errors {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            .password-errors.show {
                display: flex;
            }
            .password-error-item {
                color: #dc3545;
                font-size: 12px;
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
            .register-container button:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }
            .message-box {
                margin-top: 15px;
                font-size: 14px;
                text-align: center;
                color: red;
                display: none;
            }
            .message-box.show {
                display: block;
            }
            .message-box.success {
                color: #28a745;
            }
            .message-box.error {
                color: #dc3545;
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

    clearFieldErrors() {
        this.usernameError.textContent = "";
        this.usernameError.classList.remove("show");
        this.emailError.textContent = "";
        this.emailError.classList.remove("show");
        this.passwordError.innerHTML = "";
        this.passwordError.classList.remove("show");
    }

    showFieldErrors(fieldErrors) {
        this.clearFieldErrors();

        if (fieldErrors.name) {
            this.usernameError.textContent = this.formatErrorMessage(fieldErrors.name);
            this.usernameError.classList.add("show");
        }

        if (fieldErrors.email) {
            this.emailError.textContent = this.formatErrorMessage(fieldErrors.email);
            this.emailError.classList.add("show");
        }

        if (fieldErrors.password) {
            const passwordErrors = Array.isArray(fieldErrors.password) 
                ? fieldErrors.password 
                : [fieldErrors.password];
            
            this.displayPasswordErrors(passwordErrors);
            this.passwordError.classList.add("show");
        }

        if (fieldErrors.validation) {
            this.displayPasswordErrors([fieldErrors.validation]);
            this.passwordError.classList.add("show");
        }
    }

    formatErrorMessage(error) {
        if (Array.isArray(error)) {
            return error.join(", ");
        }
        return error;
    }

    displayPasswordErrors(errors) {
        this.passwordError.textContent = "";
        
        for (let i = 0; i < errors.length; i++) {
            const err = errors[i];
            const errorSpan = document.createElement("span");
            errorSpan.className = "password-error-item";
            errorSpan.textContent = "• " + err;
            this.passwordError.appendChild(errorSpan);
        }
    }

    showMessage(message, type = "info") {
        this.messageBox.textContent = message;
        this.messageBox.className = `message-box ${type} show`;
    }

    clearMessage() {
        this.messageBox.textContent = "";
        this.messageBox.className = "message-box";
    }

    setLoading(isLoading) {
        this.submitBtn.disabled = isLoading;
        this.submitBtn.textContent = isLoading ? "Cargando..." : "Registrarse";
    }

    clearForm() {
        this.inputUsername.value = "";
        this.inputEmail.value = "";
        this.inputPassword.value = "";
        this.clearFieldErrors();
    }
}