import express from "express";
import db from "./config/database.js";
import dentisteRoutes from "./routes/dentisteRoutes.js";
import SecretaireRoutes from "./routes/SecretaireRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import dotenv from 'dotenv';
import cors from "cors";
//import RendezVousRoutes from "./routes/RendezVousRoutes.js";
import PatientRoutes from "./routes/PatientRoutes.js"; // 👈 importer le routeur patients
import AdminRoutes from "./routes/admin.js";

dotenv.config();
const app = express();

// CORS
app.use(cors({ 
  origin: "http://localhost:5173", 
  methods: ["GET","POST","PUT","DELETE"], 
  credentials: true 
}));

// JSON parser
app.use(express.json());

// Routes
app.use("/dentistes", dentisteRoutes);
app.use("/secretaires", SecretaireRoutes);
app.use("/auth", authRoutes);
//app.use("/rendezvous", RendezVousRoutes);
app.use("/patients", PatientRoutes);
app.use("/admin", AdminRoutes);

// Connexion DB et synchronisation
try {
  await db.authenticate();
  console.log("✅ Connexion à la base réussie !");

  // 🔹 Crée toutes les tables définies dans les modèles si elles n'existent pas
  await db.sync({ alter: true });
  console.log("✅ Modèles synchronisés avec succès !");
} catch (error) {
  console.error("❌ Erreur de connexion ou synchronisation :", error);
}

// Test route
app.get("/", (req,res) => res.send("🚀 API Cabinet Dentaire en marche !"));

// Lancement serveur
app.listen(5000, () => console.log("🚀 Serveur lancé sur http://localhost:5000"));
