import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./User.js";

const Secretaire = db.define("Secretaire", {
  bureau: {
    type: DataTypes.STRING,
    allowNull: true, // facultatif
  },
});

// Relation : un User peut être une Secretaire
User.hasOne(Secretaire, { foreignKey: "userId" });
Secretaire.belongsTo(User, { foreignKey: "userId" });

export default Secretaire;
