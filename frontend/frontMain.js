import RegisterViewComponent from "./components/registerViewComponent.js";
import LoginViewComponent from "./components/loginViewComponent.js";
import RegisterDispatcher from "./Dispatcher/registerDispatcher.js";
import LoginDispatcher from "./Dispatcher/LoginDispatcher.js";

customElements.define("register-view", RegisterViewComponent);
customElements.define("login-view", LoginViewComponent);

function main() {
  const registerDispatcher = new RegisterDispatcher();
  const loginDispatcher = new LoginDispatcher();

  const register = new RegisterViewComponent(registerDispatcher);
  const login = new LoginViewComponent(loginDispatcher);

  document.body.appendChild(register);
  document.body.appendChild(login);
}

window.onload = main;