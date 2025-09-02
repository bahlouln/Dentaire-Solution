import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";


const router = express.Router();
router.use(authMiddleware); // toutes les routes nécessitent authentification
router.use(authorizeRoles("secretaire","dentiste"));
//router.get("/", getRendezVous);
// Routes
router.post("/", createPatient);      // ➕ Ajouter patient
router.get("/", getPatients);         // 📋 Liste patients
router.get("/:id", getPatientById);   // 🔍 Un patient
router.put("/:id", updatePatient);    // ✏️ Modifier
router.delete("/:id", deletePatient); // ❌ Supprimer

export default router;
