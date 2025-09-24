export default class LoginHandler {
  async login(data) {
    const res = await fetch("http://localhost:5050/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }
}
