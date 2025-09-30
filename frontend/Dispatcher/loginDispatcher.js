export default class LoginDispatcher {
  async login({ email, password }) {
    const res = await fetch("http://localhost:5050/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error en login");
    }

    return res.json(); // { message, token, user }
  }
}
