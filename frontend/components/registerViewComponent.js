export default class RegisterViewComponent extends HTMLElement {
  constructor(registerHandler) {
    super();
    if (!registerHandler) throw new Error("RegisterHandler is required");
    this.registerHandler = registerHandler;

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

  async onFormSubmit(event) {
    event.preventDefault();

    if (event.submitter !== this.submitBtn) return;

    const username = this.inputUsername.value;
    const email = this.inputEmail.value;
    const password = this.inputPassword.value;

    try {
      const result = await this.registerHandler.register({ username, email, password });
      this.messageBox.textContent = result.message;
    } catch (err) {
      console.error(err);
      this.messageBox.textContent = "Error registrando usuario";
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
