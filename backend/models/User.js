import { DataTypes } from "sequelize";
import db from "../config/database.js";
import bcrypt from "bcryptjs"; 
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
// hash avant save
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.motDePasse = await bcrypt.hash(user.motDePasse, salt);
});

export default User;
