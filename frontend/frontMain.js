import LoginViewComponent from "./components/loginViewComponent.js";
import RegisterViewComponent from "./components/registerViewComponent.js";
import DashboardViewComponent from "./components/dashboardViewComponent.js";
import CanvasViewComponent from "./components/canvasViewComponent.js";

import LoginModel from "./models/loginModel.js";
import { RegisterModel } from "./models/registerModel.js";
import DashboardModel from "./models/dashboardModel.js";
import CanvasModel from "./models/canvasModel.js";

customElements.define("login-view", LoginViewComponent);
customElements.define("register-view", RegisterViewComponent);
customElements.define("dashboard-view", DashboardViewComponent);
customElements.define("canvas-view", CanvasViewComponent);

class FrontendRouter {
    constructor() {
        this.routes = {
            "/auth/login": {
                component: "login-view",
                model: LoginModel,
                requiresAuth: false
            },
            "/auth/register": {
                component: "register-view",
                model: RegisterModel,
                requiresAuth: false
            },
            "/dashboard": {
                component: "dashboard-view",
                model: DashboardModel,
                requiresAuth: true
            }
        };
    }

    getCurrentRoute() {
        const pathname = window.location.pathname;
        return pathname === "/" ? "/auth/login" : pathname;
    }

    isAuthenticated() {
        const token = sessionStorage.getItem("token");
        const userData = sessionStorage.getItem("userData");
        return !!(token && userData);
    }

    redirectToLogin() {
        window.location.href = "/auth/login";
    }

    redirectToDashboard() {
        window.location.href = "/dashboard";
    }

    async route() {
        const currentRoute = this.getCurrentRoute();
        const routeConfig = this.routes[currentRoute];

        if (!routeConfig) {
            console.warn(`Ruta no encontrada: ${currentRoute}`);
            this.redirectToLogin();
            return;
        }

        if (routeConfig.requiresAuth && !this.isAuthenticated()) {
            console.warn("Acceso denegado: Se requiere autenticación");
            this.redirectToLogin();
            return;
        }

        if (!routeConfig.requiresAuth && this.isAuthenticated()) {
            if (currentRoute === "/auth/login" || currentRoute === "/auth/register") {
                this.redirectToDashboard();
                return;
            }
        }

        this.loadComponent(routeConfig);
    }

    loadComponent(routeConfig) {
        try {
            const modelInstance = new routeConfig.model();
            const viewElement = document.createElement(routeConfig.component);
            viewElement.modelInstance = modelInstance;
            document.body.innerHTML = "";
            document.body.appendChild(viewElement);

            console.log(`Componente ${routeConfig.component} cargado correctamente`);
        } catch (err) {
            console.error(`Error cargando componente: ${err.message}`);
            this.redirectToLogin();
        }
    }
}

let globalRouter = null;

function main() {
    globalRouter = new FrontendRouter();
    globalRouter.route();
    window.addEventListener("popstate", handleRouteChange);
    window.appRouter = globalRouter;
}

function handleRouteChange() {
    if (globalRouter) {
        globalRouter.route();
    }
}

window.onload = main;