import LoginViewComponent from "./components/loginViewComponent.js";
import LoginDispatcher from "./Dispatcher/LoginDispatcher.js";

customElements.define("login-view", LoginViewComponent);

function main() {
    const loginDispatcher = new LoginDispatcher();
    const login = new LoginViewComponent(loginDispatcher);
    document.body.appendChild(login);
}

window.onload = main;
