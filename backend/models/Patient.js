import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Dentiste from "./Dentiste.js";

const Patient = db.define("Patient", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    validate: { isEmail: true },
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateNaissance: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
Dentiste.hasMany(Patient, { foreignKey: "dentisteId", onDelete: "CASCADE" });
Patient.belongsTo(Dentiste, { foreignKey: "dentisteId" });

export default Patient;
