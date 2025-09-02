import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";
import {
  createSecretaire,
  getSecretaires,
  getSecretaireById,
  updateSecretaire,
  deleteSecretaire,
} from "../controllers/SecretaireController.js";


const router = express.Router();

// Routes
router.post("/", authMiddleware, authorizeRoles("dentiste"), createSecretaire);      // ➕ Ajouter secrétaire
router.get("/", authMiddleware, authorizeRoles("admin","dentiste"), getSecretaires);         // 📋 Liste secrétaires
router.get("/:id",  authMiddleware, authorizeRoles("admin","dentiste"),getSecretaireById);   // 🔍 Une secrétaire
router.put("/:id",  authMiddleware, authorizeRoles("dentiste"),updateSecretaire);    // ✏️ Modifier
router.delete("/:id", authMiddleware, authorizeRoles("dentiste"), deleteSecretaire); // ❌ Supprimer

export default router;
