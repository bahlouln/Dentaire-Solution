import express from "express";
import {
  getRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVous,
  deleteRendezVous,
} from "../controllers/RendezVousController.js";

const router = express.Router();

// Routes
router.post("/", createRendezVous);        // ➕ Ajouter rendez-vous
router.get("/", getRendezVous);           // 📋 Liste rendez-vous
router.get("/:id", getRendezVousById);    // 🔍 Un rendez-vous
router.put("/:id", updateRendezVous);     // ✏️ Modifier
router.delete("/:id", deleteRendezVous);  // ❌ Supprimer

export default router;
