export default class RegisterDispatcher {
  async register({ username, email, password }) {
    const res = await fetch("http://localhost:5050/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error en registro");
    }

    return res.json();
  }
}