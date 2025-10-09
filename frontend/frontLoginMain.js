import LoginViewComponent from "./components/loginViewComponent.js";
import LoginModel from "./models/loginModel.js";

customElements.define("login-view", LoginViewComponent);

function main() {
    const loginModel = new LoginModel();
    const loginView = new LoginViewComponent(loginModel);
    document.body.appendChild(loginView);
}

window.onload = main;
