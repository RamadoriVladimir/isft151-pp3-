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
        this.view.clearMessage();
        this.view.clearFieldErrors();

        const success = await this.model.authenticate(email, password);

        this.view.setLoading(false);

        if (success) {
            const userData = this.model.getUserData();
            this.view.showMessage("Bienvenido " + userData.name, "success");
            
            const token = this.model.getToken();
            
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('userData', JSON.stringify(userData));
            
            setTimeout(function() {
                window.location.href = "/dashboard";
            }, 1000);
        } else {
            const error = this.model.getError();
            const fieldErrors = this.model.getFieldErrors();
            
            if (Object.keys(fieldErrors).length > 0) {
                this.view.showFieldErrors(fieldErrors);
            } else {
                this.view.showMessage(error, "error");
            }
        }
    }
}