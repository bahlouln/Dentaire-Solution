import express from "express";
import db from "./config/database.js";
import Patient from "./models/Patient.js";
import User from "./models/User.js";
import Dentiste from "./models/Dentiste.js";
import rendezVousRoutes from "./routes/RendezVousRoutes.js";
import patientRoutes from "./routes/PatientRoutes.js";
import dentisteRoutes from "./routes/dentisteRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import SecretaireRoutes from "./routes/SecretaireRoutes.js";
const app = express();
app.use(express.json());
app.use("/appointment", rendezVousRoutes);
app.use("/patients", patientRoutes);
app.use("/dentistes", dentisteRoutes);
app.use("/users", userRoutes);
app.use("/secretaires", SecretaireRoutes);

// Connexion & synchronisation
try {
  await db.authenticate();
  console.log("✅ Connexion à la base réussie !");
  await db.sync({ alter: true }); // crée/maj les tables
  console.log("✅ Modèles synchronisés !");
} catch (error) {
  console.error("❌ Erreur de connexion à la base :", error);
}

app.get("/", (req, res) => {
  res.send("🚀 API Cabinet Dentaire en marche !");
});

app.listen(5000, () => console.log("🚀 Serveur lancé sur http://localhost:5000"));
