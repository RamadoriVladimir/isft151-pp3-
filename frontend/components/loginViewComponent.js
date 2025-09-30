export default class LoginViewComponent extends HTMLElement {
  constructor(loginDispatcher) {
    super();
    if (!loginDispatcher) throw new Error("LoginDispatcher is required");
    this.loginDispatcher = loginDispatcher;

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
