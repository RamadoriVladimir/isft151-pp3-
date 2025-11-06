import LoginController from "../controllers/loginController.js";

export default class LoginViewComponent extends HTMLElement {
    constructor() {
        super();

        this.modelInstance = null;
        this.innerController = null;

        this.buildUI();
    }

    buildUI() {
        this.attachShadow({ mode: "open" });

        this.container = document.createElement("div");
        this.container.className = "login-container";

        this.loginTitle = document.createElement("h2");
        this.loginTitle.textContent = "Iniciar Sesión";

        this.form = document.createElement("form");

        // Email field
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

        // Password field
        this.passwordWrapper = document.createElement("div");
        this.passwordWrapper.className = "input-wrapper";
        this.inputPassword = document.createElement("input");
        this.inputPassword.type = "password";
        this.inputPassword.name = "password";
        this.inputPassword.placeholder = "Contraseña";
        this.inputPassword.required = true;
        this.passwordError = document.createElement("span");
        this.passwordError.className = "error-message";
        this.passwordWrapper.appendChild(this.inputPassword);
        this.passwordWrapper.appendChild(this.passwordError);

        this.submitBtn = document.createElement("button");
        this.submitBtn.type = "submit";
        this.submitBtn.textContent = "Iniciar Sesión";

        this.messageBox = document.createElement("div");
        this.messageBox.className = "message-box";

        this.registerContainer = document.createElement("div");
        this.registerContainer.className = "register-container";

        this.registerLink = document.createElement("a");
        this.registerLink.href = "/auth/register";
        this.registerLink.textContent = "¿No tienes una cuenta? Regístrate";

        this.registerContainer.appendChild(this.registerLink);

        this.form.appendChild(this.emailWrapper);
        this.form.appendChild(this.passwordWrapper);
        this.form.appendChild(this.submitBtn);

        this.container.appendChild(this.loginTitle);
        this.container.appendChild(this.form);
        this.container.appendChild(this.messageBox);
        this.container.appendChild(this.registerContainer);

        const style = document.createElement("style");
        style.textContent = `
            .login-container {
                width: 340px;
                margin: 50px auto;
                padding: 25px;
                border: 1px solid #ccc;
                border-radius: 10px;
                background: #f9f9f9;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .login-container h2 {
                text-align: center;
                margin-bottom: 20px;
                color: #333;
            }
            .login-container form {
                display: flex;
                flex-direction: column;
            }
            .input-wrapper {
                display: flex;
                flex-direction: column;
                margin: 10px 0;
            }
            .login-container input {
                padding: 12px;
                border: 1px solid #aaa;
                border-radius: 5px;
                font-size: 14px;
                transition: border-color 0.3s ease;
            }
            .login-container input:focus {
                outline: none;
                border-color: #007BFF;
                box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
            }
            .login-container input.error-input {
                border-color: #dc3545;
            }
            .error-message {
                color: #dc3545;
                font-size: 12px;
                margin-top: 5px;
                padding: 5px 8px;
                background: #f8d7da;
                border-radius: 3px;
                border-left: 3px solid #dc3545;
                display: none;
            }
            .error-message.show {
                display: block;
            }
            .login-container button {
                padding: 12px;
                margin-top: 15px;
                background: #007BFF;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                font-size: 14px;
                transition: background 0.3s ease;
            }
            .login-container button:hover {
                background: #0056b3;
            }
            .login-container button:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }
            .message-box {
                margin-top: 15px;
                padding: 10px;
                font-size: 14px;
                text-align: center;
                border-radius: 5px;
                display: none;
            }
            .message-box.show {
                display: block;
            }
            .message-box.success {
                color: #155724;
                background: #d4edda;
                border: 1px solid #c3e6cb;
            }
            .message-box.error {
                color: #721c24;
                background: #f8d7da;
                border: 1px solid #f5c6cb;
            }
            .register-container {
                margin-top: 15px;
                text-align: center;
            }
            .register-container a {
                color: #007BFF;
                text-decoration: none;
                font-size: 14px;
            }
            .register-container a:hover {
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
            setTimeout(function() {
                this.checkModelAndInit();
            }.bind(this), 10);
        }
    }

    initializeController() {
        this.innerController = new LoginController(this, this.modelInstance);

        this.boundSubmit = this.innerController.onLoginFormSubmit.bind(this.innerController);
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

    getEmailValue() {
        return this.inputEmail.value.trim();
    }

    getPasswordValue() {
        return this.inputPassword.value;
    }

    clearFieldErrors() {
        this.emailError.textContent = "";
        this.emailError.classList.remove("show");
        this.inputEmail.classList.remove("error-input");
        
        this.passwordError.textContent = "";
        this.passwordError.classList.remove("show");
        this.inputPassword.classList.remove("error-input");
    }

    showFieldErrors(fieldErrors) {
        this.clearFieldErrors();

        if (fieldErrors.email) {
            this.emailError.textContent = this.formatErrorMessage(fieldErrors.email);
            this.emailError.classList.add("show");
            this.inputEmail.classList.add("error-input");
        }

        if (fieldErrors.password) {
            this.passwordError.textContent = this.formatErrorMessage(fieldErrors.password);
            this.passwordError.classList.add("show");
            this.inputPassword.classList.add("error-input");
        }

        if (fieldErrors.validation) {
            this.passwordError.textContent = fieldErrors.validation;
            this.passwordError.classList.add("show");
            this.inputPassword.classList.add("error-input");
        }

        if (fieldErrors.general) {
            this.showMessage(fieldErrors.general, "error");
        }
    }

    formatErrorMessage(error) {
        if (Array.isArray(error)) {
            return error.join(", ");
        }
        return error;
    }

    showMessage(message, type) {
        this.messageBox.textContent = message;
        this.messageBox.className = "message-box " + type + " show";
    }

    clearMessage() {
        this.messageBox.textContent = "";
        this.messageBox.className = "message-box";
    }

    setLoading(isLoading) {
        this.submitBtn.disabled = isLoading;
        this.submitBtn.textContent = isLoading ? "Cargando..." : "Iniciar Sesión";
    }

    clearForm() {
        this.inputEmail.value = "";
        this.inputPassword.value = "";
        this.clearFieldErrors();
    }
}