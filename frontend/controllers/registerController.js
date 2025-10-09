export class RegisterController {
    constructor(viewInstance, modelInstance) {
        this.view = viewInstance;
        this.model = modelInstance;
    }

    init() {
        console.log('RegisterController initialized');
    }

    release() {
        console.log('RegisterController released');
    }

    async onRegisterFormSubmit(event) {
        event.preventDefault();

        const username = this.view.getUsernameValue();
        const email = this.view.getEmailValue();
        const password = this.view.getPasswordValue();

        if (!username || !email || !password) {
            this.view.showMessage("Por favor complete todos los campos", "error");
            return;
        }

        this.view.setLoading(true);

        const success = await this.model.registerUser(username, email, password);

        this.view.setLoading(false);

        if (success) {
            const successMsg = this.model.getSuccessMessage();
            this.view.showMessage(successMsg, "success");
            this.view.clearForm();
            
            setTimeout(() => {
                window.location.href = "/auth/login";
            }, 2000);
        } else {
            const error = this.model.getError();
            this.view.showMessage(error, "error");
        }
    }
}
