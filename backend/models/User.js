import { DataTypes } from "sequelize";
import db from "../config/database.js";

const User = db.define("User", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: { isEmail: true },
  },
  motDePasse: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("dentiste", "secretaire", "admin"),
    defaultValue: "dentiste",
  },
});

export default User;
