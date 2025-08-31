import express from "express";
import db from "./config/database.js";
import rendezVousRoutes from "./routes/RendezVousRoutes.js";
import patientRoutes from "./routes/PatientRoutes.js";
import dentisteRoutes from "./routes/dentisteRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import SecretaireRoutes from "./routes/SecretaireRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import authMiddleware from './middlewares/authMiddleware.js'; 
import dotenv from 'dotenv';
import cors from "cors";

dotenv.config();
const app = express();

// ✅ CORS AVANT les routes
app.use(cors({
  origin: "http://localhost:5173",  // ton frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ JSON parser
app.use(express.json());

// ✅ Routes
app.use("/appointment", authMiddleware, rendezVousRoutes);
app.use("/patients", patientRoutes);
app.use("/dentistes", dentisteRoutes);
app.use("/users", userRoutes);
app.use("/secretaires", SecretaireRoutes);
app.use("/auth", authRoutes);

// Connexion & synchronisation
try {
  await db.authenticate();
  console.log("✅ Connexion à la base réussie !");
  await db.sync({ alter: true }); 
  console.log("✅ Modèles synchronisés !");
} catch (error) {
  console.error("❌ Erreur de connexion à la base :", error);
}

// Route test
app.get("/", (req, res) => {
  res.send("🚀 API Cabinet Dentaire en marche !");
});

app.listen(5000, () => console.log("🚀 Serveur lancé sur http://localhost:5000"));
