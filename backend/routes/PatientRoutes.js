import express from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

const router = express.Router();

// Routes
router.post("/", createPatient);      // ➕ Ajouter patient
router.get("/", getPatients);         // 📋 Liste patients
router.get("/:id", getPatientById);   // 🔍 Un patient
router.put("/:id", updatePatient);    // ✏️ Modifier
router.delete("/:id", deletePatient); // ❌ Supprimer

export default router;
