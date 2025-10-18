import { DataTypes } from "sequelize";
import db from "../config/database.js";
import bcrypt from "bcryptjs";

const User = db.define("User", {
  nom: { type: DataTypes.STRING, allowNull: false },
  prenom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
  motDePasse: { type: DataTypes.STRING, allowNull: false },
  adresse: { type: DataTypes.STRING, allowNull: false },
  numero: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    validate: { 
      is: /^[0-9]{8}$/, // vérifie que c’est un numéro à 8 chiffres
    } 
  },
  role: { 
    type: DataTypes.ENUM("dentiste", "secretaire", "admin"), 
    defaultValue: "dentiste" 
  },
});


// Hash mot de passe avant création
User.beforeCreate(async (user) => {
  if (user.motDePasse && !user.motDePasse.startsWith("$2a$")) { 
    const salt = await bcrypt.genSalt(10);
    user.motDePasse = await bcrypt.hash(user.motDePasse, salt);
  }
});

// Hash mot de passe avant update si modifié
User.beforeUpdate(async (user) => {
  if (user.changed("motDePasse") && !user.motDePasse.startsWith("$2a$")) {
    const salt = await bcrypt.genSalt(10);
    user.motDePasse = await bcrypt.hash(user.motDePasse, salt);
  }
});

export default User;
