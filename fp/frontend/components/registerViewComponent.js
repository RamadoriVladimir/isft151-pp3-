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

        // Username field
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

        // Password requirements info
        this.passwordRequirements = document.createElement("div");
        this.passwordRequirements.className = "password-requirements";

        const requirementsTitle = document.createElement("div");
        requirementsTitle.className = "requirements-title";
        requirementsTitle.textContent = "La contraseña debe contener:";

        const requirementsList = document.createElement("ul");
        requirementsList.className = "requirements-list";

        // Create requirement items
        this.reqLength = this.createRequirementItem("req-length", "Al menos 8 caracteres");
        this.reqUppercase = this.createRequirementItem("req-uppercase", "Al menos una letra mayúscula");
        this.reqLowercase = this.createRequirementItem("req-lowercase", "Al menos una letra minúscula");
        this.reqNumber = this.createRequirementItem("req-number", "Al menos un número");
        this.reqSpecial = this.createRequirementItem("req-special", "Al menos un carácter especial (!@#$%^&*(),.?\":{}|<>)");

        requirementsList.appendChild(this.reqLength);
        requirementsList.appendChild(this.reqUppercase);
        requirementsList.appendChild(this.reqLowercase);
        requirementsList.appendChild(this.reqNumber);
        requirementsList.appendChild(this.reqSpecial);

        this.passwordRequirements.appendChild(requirementsTitle);
        this.passwordRequirements.appendChild(requirementsList);

        this.passwordError = document.createElement("div");
        this.passwordError.className = "error-message password-errors";
        
        this.passwordWrapper.appendChild(this.inputPassword);
        this.passwordWrapper.appendChild(this.passwordRequirements);
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
        this.loginLink.textContent = "¿Ya tienes una cuenta? Inicia sesión";

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
                width: 360px;
                margin: 50px auto;
                padding: 25px;
                border: 1px solid #ccc;
                border-radius: 10px;
                background: #f9f9f9;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .register-container h2 {
                text-align: center;
                margin-bottom: 20px;
                color: #333;
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
                margin-top: 5px;
            }
            .password-errors.show {
                display: flex;
            }
            .password-error-item {
                color: #dc3545;
                font-size: 12px;
                padding: 3px 8px;
                background: #f8d7da;
                border-radius: 3px;
                border-left: 3px solid #dc3545;
            }
            
            /* Password Requirements Styles */
            .password-requirements {
                margin-top: 8px;
                padding: 10px;
                background: #e7f3ff;
                border: 1px solid #b3d9ff;
                border-radius: 5px;
                font-size: 12px;
            }
            .requirements-title {
                font-weight: bold;
                color: #0056b3;
                margin-bottom: 6px;
            }
            .requirements-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .requirements-list li {
                padding: 3px 0;
                color: #666;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .req-icon {
                display: inline-block;
                width: 14px;
                height: 14px;
                text-align: center;
                font-weight: bold;
                color: #999;
            }
            .requirements-list li.valid {
                color: #28a745;
            }
            .requirements-list li.valid .req-icon {
                color: #28a745;
            }
            .requirements-list li.valid .req-icon::before {
                content: "✓";
            }
            .requirements-list li.invalid {
                color: #dc3545;
            }
            .requirements-list li.invalid .req-icon {
                color: #dc3545;
            }
            .requirements-list li.invalid .req-icon::before {
                content: "✗";
            }
            
            .register-container button {
                padding: 10px;
                margin-top: 12px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
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

    createRequirementItem(id, text) {
        const li = document.createElement("li");
        li.id = id;

        const icon = document.createElement("span");
        icon.className = "req-icon";
        icon.textContent = "○";

        const textNode = document.createTextNode(text);

        li.appendChild(icon);
        li.appendChild(textNode);

        return li;
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

        // Add real-time password validation
        this.boundPasswordInput = this.validatePasswordRealtime.bind(this);
        this.inputPassword.addEventListener("input", this.boundPasswordInput);

        this.innerController.init();
    }

    disconnectedCallback() {
        if (this.boundSubmit) {
            this.form.removeEventListener("submit", this.boundSubmit);
            this.boundSubmit = null;
        }
        if (this.boundPasswordInput) {
            this.inputPassword.removeEventListener("input", this.boundPasswordInput);
            this.boundPasswordInput = null;
        }
        if (this.innerController) {
            this.innerController.release();
        }
    }

    validatePasswordRealtime() {
        const password = this.inputPassword.value;
        
        // Validate each requirement
        this.updateRequirement(this.reqLength, password.length >= 8);
        this.updateRequirement(this.reqUppercase, /[A-Z]/.test(password));
        this.updateRequirement(this.reqLowercase, /[a-z]/.test(password));
        this.updateRequirement(this.reqNumber, /[0-9]/.test(password));
        this.updateRequirement(this.reqSpecial, /[!@#$%^&*(),.?":{}|<>]/.test(password));
    }

    updateRequirement(element, isValid) {
        if (isValid) {
            element.classList.remove("invalid");
            element.classList.add("valid");
        } else {
            element.classList.remove("valid");
            element.classList.add("invalid");
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
        this.passwordError.textContent = "";
        this.passwordError.classList.remove("show");
        
        // Clear all child elements from password errors
        while (this.passwordError.firstChild) {
            this.passwordError.removeChild(this.passwordError.firstChild);
        }
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

    displayPasswordErrors(errors) {
        // Clear existing errors
        while (this.passwordError.firstChild) {
            this.passwordError.removeChild(this.passwordError.firstChild);
        }
        
        for (let i = 0; i < errors.length; i++) {
            const err = errors[i];
            const errorDiv = document.createElement("div");
            errorDiv.className = "password-error-item";
            errorDiv.textContent = err;
            this.passwordError.appendChild(errorDiv);
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
        
        // Reset password requirements display
        this.reqLength.classList.remove("valid", "invalid");
        this.reqUppercase.classList.remove("valid", "invalid");
        this.reqLowercase.classList.remove("valid", "invalid");
        this.reqNumber.classList.remove("valid", "invalid");
        this.reqSpecial.classList.remove("valid", "invalid");
    }
}