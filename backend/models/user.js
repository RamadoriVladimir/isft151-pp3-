export default class User {
  constructor({ id = null, username, email, password }) {
    this.id = id; 
    this.username = username;
    this.email = email;
    this.password = password; 
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
    };
  }
}
