import express from "express";
import {
  createSecretaire,
  getSecretaires,
  getSecretaireById,
  updateSecretaire,
  deleteSecretaire,
} from "../controllers/SecretaireController.js";

const router = express.Router();

// Routes
router.post("/", createSecretaire);      // ➕ Ajouter secrétaire
router.get("/", getSecretaires);         // 📋 Liste secrétaires
router.get("/:id", getSecretaireById);   // 🔍 Une secrétaire
router.put("/:id", updateSecretaire);    // ✏️ Modifier
router.delete("/:id", deleteSecretaire); // ❌ Supprimer

export default router;
