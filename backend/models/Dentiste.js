import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./User.js";

const Dentiste = db.define("Dentiste", {
  specialite: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Relation : un User peut être un Dentiste
User.hasOne(Dentiste, { foreignKey: "userId" });
Dentiste.belongsTo(User, { foreignKey: "userId" });

export default Dentiste;
