export default class Mold {
    constructor({ id = null, name, description, creation_date = null }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.creation_date = creation_date;
    }

    toJSON() {
    return {
        id: this.id,
        name: this.name,
        description: this.description,
        creation_date: this.creation_date,
    };
  }
}        