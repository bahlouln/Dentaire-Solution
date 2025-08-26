import express from "express";
import {
  getRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVous,
  deleteRendezVous,
} from "../controllers/RendezVousController.js";
import authMiddleware from "../middlewares/authMiddleware.js"; // 👈 importer middleware
//seuls les utilisateurs connectés puissent gérer les rendez-vous.
const router = express.Router();

// Routes protégées
router.post("/", authMiddleware, createRendezVous);   // ➕ Ajouter rendez-vous (protégé)
router.get("/", authMiddleware, getRendezVous);       // 📋 Liste rendez-vous
router.get("/:id", authMiddleware, getRendezVousById);
router.put("/:id", authMiddleware, updateRendezVous);
router.delete("/:id", authMiddleware, deleteRendezVous);
export default router;
