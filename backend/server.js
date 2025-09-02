import express from "express";
import db from "./config/database.js";
import dentisteRoutes from "./routes/dentisteRoutes.js";
import SecretaireRoutes from "./routes/SecretaireRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import authMiddleware from './middlewares/authMiddleware.js'; 
import dotenv from 'dotenv';
import cors from "cors";
import RendezVousRoutes from "./routes/RendezVousRoutes.js";

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
app.use("/rendezvous", RendezVousRoutes);

// Connexion DB
try {
  await db.authenticate();
  console.log("✅ Connexion à la base réussie !");

  console.log("✅ Modèles recréés avec succès !");
} catch (error) {
  console.error("❌ Erreur de connexion à la base :", error);
}

// Test route
app.get("/", (req,res) => res.send("🚀 API Cabinet Dentaire en marche !"));

app.listen(5000, () => console.log("🚀 Serveur lancé sur http://localhost:5000"));
