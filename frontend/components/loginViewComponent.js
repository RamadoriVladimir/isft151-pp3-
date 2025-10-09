export default class LoginViewComponent extends HTMLElement {
    constructor(loginDispatcher) {
        super();
        if (!loginDispatcher) throw new Error("LoginDispatcher is required");
        this.loginDispatcher = loginDispatcher;

        this.attachShadow({ mode: "open" });

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

        this.registerContainer = document.createElement("div");
        this.registerContainer.className = "register-container";

        this.registerLink = document.createElement("a");
        this.registerLink.href = "http://localhost:5050/auth/register";
        this.registerLink.textContent = "¿No tienes una cuenta? Regístrate";

        this.registerContainer.appendChild(this.registerLink);

        this.appendChild(this.container);
        this.form.appendChild(this.inputEmail);
        this.form.appendChild(this.inputPassword);
        this.form.appendChild(this.submitBtn);

        this.container.appendChild(this.loginTitle);
        this.container.appendChild(this.form);
        this.container.appendChild(this.registerContainer);
        this.container.appendChild(this.messageBox);

        const style = document.createElement("style");
        style.textContent = `
            .login-container {
                width: 300px;
                margin: 50px auto;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 10px;
                background: #f9f9f9;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .login-container h2 {
                text-align: center;
                margin-bottom: 20px;
            }
            .login-container form {
                display: flex;
                flex-direction: column;
            }
            .login-container input {
                padding: 10px;
                margin: 8px 0;
                border: 1px solid #aaa;
                border-radius: 5px;
                font-size: 14px;
            }
            .login-container button {
                padding: 10px;
                margin-top: 12px;
                background: #007BFF;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            .login-container button:hover {
                background: #0056b3;
            }
            .message-box {
                margin-top: 15px;
                font-size: 14px;
                text-align: center;
                color: red;
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

    
    async onFormSubmit(event) {
        event.preventDefault();

        const email = this.inputEmail.value;
        const password = this.inputPassword.value;

        try {
        const result = await this.loginDispatcher.login({ email, password });
        this.messageBox.textContent = result.message;
        } catch (err) {
        console.error(err);
        this.messageBox.textContent = "Error en login";
        }
    }

    connectedCallback() {
        this.boundSubmit = this.onFormSubmit.bind(this);
        this.form.addEventListener("submit", this.boundSubmit);
    }

    disconnectedCallback() {
        this.form.removeEventListener("submit", this.boundSubmit);
        this.boundSubmit = null;
    }
}
