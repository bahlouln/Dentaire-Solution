import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Patient from "./Patient.js";

const Diagnostique = db.define("Diagnostique", {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // par défaut, la date actuelle
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false, // un diagnostique doit toujours avoir une description
  },
});

// Relation : un Patient peut avoir plusieurs Diagnostiques
Patient.hasMany(Diagnostique, { foreignKey: "patientId", onDelete: "CASCADE" });
Diagnostique.belongsTo(Patient, { foreignKey: "patientId" });

export default Diagnostique;
