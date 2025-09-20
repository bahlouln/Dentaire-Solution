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
} from "../controllers/patientController.js";


const router = express.Router();
router.use(authMiddleware); // toutes les routes nécessitent authentification
router.use(authorizeRoles("secretaire","dentiste"));
//router.get("/", getRendezVous);
// Routes
router.post("/", createPatient);      // ➕ Ajouter patient
router.get("/", getPatients);    
router.get("/me", getPatientsByDentisteConnecte ); // 📋 Liste patients dentiste connecté
     
router.get("/:id", getPatientById);   // 🔍 Un patient
router.put("/:id", updatePatient);    // ✏️ Modifier
router.delete("/:id", deletePatient); // ❌ Supprimer
router.post("/dentistes/:dentisteId/patients", createPatientByDentiste); // ➕ Ajouter patient à un dentiste
router.get("/dentistes/:dentisteId/patients", getPatientsByDentiste);    // 📋 Liste patients d’un dentiste
export default router;
