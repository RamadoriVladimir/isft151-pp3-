import RegisterViewComponent from "./components/registerViewComponent.js";
import LoginViewComponent from "./components/loginViewComponent.js";
import RegisterHandler from "./handlers/frontRegisterHandler.js";
import LoginHandler from "./handlers/frontLoginHandler.js";

customElements.define("register-view", RegisterViewComponent);
customElements.define("login-view", LoginViewComponent);

function main() {
  const registerHandler = new RegisterHandler();
  const loginHandler = new LoginHandler();

  const register = new RegisterViewComponent(registerHandler);
  const login = new LoginViewComponent(loginHandler);

  document.body.appendChild(register);
  document.body.appendChild(login);
}

window.onload = main;