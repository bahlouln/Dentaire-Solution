import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Patient from "./Patient.js";
import Dentiste from "./Dentiste.js";

const RendezVous = db.define("RendezVous", {
  dateDebut: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dateFin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM("planifié", "annulé", "terminé"),
    defaultValue: "planifié",
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Relations
Patient.hasMany(RendezVous, { foreignKey: "patientId" });
RendezVous.belongsTo(Patient, { foreignKey: "patientId" });

Dentiste.hasMany(RendezVous, { foreignKey: "dentisteId" });
RendezVous.belongsTo(Dentiste, { foreignKey: "dentisteId" });

export default RendezVous;
