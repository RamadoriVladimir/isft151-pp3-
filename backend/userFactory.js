import User from "./models/user.js";
import { ObjectId } from "mongodb";

export default class UserFactory {
  static createFromRequest(reqBody, hashedPassword) {
    return new User({
      username: reqBody.username,
      email: reqBody.email,
      password: hashedPassword,
    });
  }

  static createFromDB(doc) {
    return new User({
      id: doc._id instanceof ObjectId ? doc._id.toString() : doc._id,
      username: doc.username,
      email: doc.email,
      password: doc.password,
    });
  }
}
