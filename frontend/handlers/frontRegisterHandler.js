export default class RegisterHandler {
  async register(data) {
    const res = await fetch("http://localhost:5050/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    return await res.json();
  }
}
