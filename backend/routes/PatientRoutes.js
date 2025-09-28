import express from "express";
import {
  createPatientByDentiste,
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientsByDentiste,
  getPatientsByDentisteConnecte,
  getPatientsAnnualStats, // <-- ajouter le contrôleur
  getPatientsBySecretaireConnecte
} from "../controllers/patientController.js";

const router = express.Router();

// ---- Routes spécifiques AVANT /:id ---- //
router.get("/me", getPatientsByDentisteConnecte); 
router.get("/secretaire/patients", getPatientsBySecretaireConnecte);
router.get("/stats/annual", getPatientsAnnualStats);
router.post("/dentistes/:dentisteId/patients", createPatientByDentiste);
router.get("/dentistes/:dentisteId/patients", getPatientsByDentiste);

// ---- Routes génériques ---- //
router.post("/", createPatient); 
router.get("/", getPatients);
router.get("/:id", getPatientById); 
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);
export default router;
