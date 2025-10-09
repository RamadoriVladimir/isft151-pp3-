import RegisterViewComponent from "./components/registerViewComponent.js";
import { RegisterModel } from "./models/registerModel.js";

customElements.define("register-view", RegisterViewComponent);

function main() {
    const registerModel = new RegisterModel();
    const registerView = new RegisterViewComponent(registerModel);
    document.body.appendChild(registerView);
}

window.onload = main;