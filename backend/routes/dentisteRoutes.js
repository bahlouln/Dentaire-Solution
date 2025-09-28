import express from "express";

import { createPatient, deletePatient, getPatients,updatePatient } from "../controllers/patientController.js";
import { createRendezVous, deleteRendezVous, getQuickStats, getRendezVous, getRendezVousAnnual, getRendezVousCourbe, getRendezVousHistogramme, updateRendezVous } from "../controllers/RendezVousController.js";
import { createSecretaire, deleteSecretaire, getSecretaires,  updateSecretaire } from "../controllers/SecretaireController.js";
import { authenticateToken } from "./AuthRoutes.js";
const router = express.Router();

// --- Middlewares ---
const requireDentiste = (req, res, next) => {
    if (!req.user || req.user.role !== 'dentiste') {
        return res.status(403).json({ error: 'Accès dentiste requis' });
    }
    next();
};



router.use(authenticateToken);
router.use(requireDentiste);

router.post("/patients", createPatient);
router.get("/patients", getPatients);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);




router.get("/secretaires",getSecretaires);
router.post("/secretaires", createSecretaire);
router.put("/secretaires/:id",  updateSecretaire);
router.delete("/secretaires/:id", deleteSecretaire);




router.get("/", getRendezVous);
router.post("/", createRendezVous);
router.put("/:id", updateRendezVous);
router.delete("/:id", deleteRendezVous);
router.get("/stats/histogramme", getRendezVousHistogramme);
router.get("/stats/courbe", getRendezVousCourbe);
router.get("/stats/quick", getQuickStats);
router.get("/stats/annual", getRendezVousAnnual);
// Routes
//router.post("/", authMiddleware, authorizeRoles("admin"), createDentiste);
//router.post("/", createDentiste);        // ➕ Ajouter dentiste
//router.get("/", getDentistes);          // 📋 Liste dentistes
//router.get("/:id", getDentisteById);    // 🔍 Un dentiste
//router.put("/:id",updateDentiste);     // ✏️ Modifier
//router.delete("/:id", deleteDentiste);  // ❌ Supprimer
//router.get("/:id/secretaires", getDentisteSecretaires); 

export default router;
