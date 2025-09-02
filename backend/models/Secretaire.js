import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./User.js";
import Dentiste from "./Dentiste.js";

const Secretaire = db.define("Secretaire", {
  bureau: {
    type: DataTypes.STRING,
    allowNull: true, // facultatif
   },
  dentisteId: {                // <-- clé étrangère vers Dentiste
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

// Relation : un User peut être une Secretaire
User.hasOne(Secretaire, { foreignKey: "userId" });
Secretaire.belongsTo(User, { foreignKey: "userId" });

// 🔗 Relation : un dentiste peut avoir plusieurs secrétaires
Dentiste.hasMany(Secretaire, { foreignKey: "dentisteId" });
Secretaire.belongsTo(Dentiste, { foreignKey: "dentisteId" });

export default Secretaire;
