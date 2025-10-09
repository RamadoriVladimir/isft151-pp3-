export default class LoginController {
    constructor(viewInstance, modelInstance) {
        this.view = viewInstance;
        this.model = modelInstance;
    }

    init() {
        console.log('LoginController initialized');
    }

    release() {
        console.log('LoginController released');
    }

    async onLoginFormSubmit(event) {
        event.preventDefault();

        const email = this.view.getEmailValue();
        const password = this.view.getPasswordValue();

        if (!email || !password) {
            this.view.showMessage("Por favor complete todos los campos", "error");
            return;
        }

        this.view.setLoading(true);

        const success = await this.model.authenticate(email, password);

        this.view.setLoading(false);

        if (success) {
            const userData = this.model.getUserData();
            this.view.showMessage(`Bienvenido ${userData.name}`, "success");
            
            // Guardar token si es necesario
            const token = this.model.getToken();
            // localStorage.setItem('token', token); // Si lo necesitas
            
            setTimeout(() => {
                // Redirigir o cambiar de vista
                window.location.href = "/dashboard";
            }, 1000);
        } else {
            const error = this.model.getError();
            this.view.showMessage(error, "error");
        }
    }
}