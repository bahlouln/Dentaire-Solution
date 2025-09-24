import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";
import {
  createPatientByDentiste,
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientsByDentiste,
  getPatientsByDentisteConnecte,
  getPatientsAnnualStats // <-- ajouter le contrôleur
} from "../controllers/patientController.js";

const router = express.Router();
router.use(authMiddleware); // toutes les routes nécessitent authentification
router.use(authorizeRoles("secretaire","dentiste"));

// Routes CRUD
router.post("/", createPatient);      // ➕ Ajouter patient
router.get("/", getPatients);    
router.get("/me", getPatientsByDentisteConnecte ); // 📋 Liste patients dentiste connecté
router.get("/:id", getPatientById);   // 🔍 Un patient
router.put("/:id", updatePatient);    // ✏️ Modifier
router.delete("/:id", deletePatient); // ❌ Supprimer

// Patients par dentiste
router.post("/dentistes/:dentisteId/patients", createPatientByDentiste); // ➕ Ajouter patient à un dentiste
router.get("/dentistes/:dentisteId/patients", getPatientsByDentiste);    // 📋 Liste patients d’un dentiste

// 📊 Statistiques annuelles des patients
router.get("/stats/annual", getPatientsAnnualStats); // <-- nouvelle route

export default router;
