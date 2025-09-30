import RegisterViewComponent from "./components/registerViewComponent.js";
import RegisterDispatcher from "./Dispatcher/registerDispatcher.js";

customElements.define("register-view", RegisterViewComponent);

function main() {
  const registerDispatcher = new RegisterDispatcher();
  const register = new RegisterViewComponent(registerDispatcher);
  document.body.appendChild(register);
}

window.onload = main;
