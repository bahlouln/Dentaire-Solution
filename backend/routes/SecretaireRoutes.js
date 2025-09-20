import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";
import {
  createSecretaire,
  getSecretaires,
  getSecretaireById,
  updateSecretaire,
  deleteSecretaire,
  getSecretairesByDentiste,
} from "../controllers/SecretaireController.js";

const router = express.Router();

// ➕ Ajouter secrétaire (dentiste seulement)
router.post("/", authMiddleware, authorizeRoles("dentiste"), createSecretaire);

// 📋 Liste des secrétaires du dentiste connecté
router.get(
  "/dentiste",
  authMiddleware,
  authorizeRoles("dentiste", "admin"),
  getSecretairesByDentiste
);

// 📋 Liste secrétaires (admin seulement)
router.get("/", authMiddleware, authorizeRoles("admin"), getSecretaires);

// 🔍 Une secrétaire par ID (admin seulement)
router.get("/:id", authMiddleware, authorizeRoles("admin"), getSecretaireById);

// ✏️ Modifier une secrétaire (dentiste seulement)
router.put("/:id", authMiddleware, authorizeRoles("dentiste"), updateSecretaire);

// ❌ Supprimer une secrétaire (dentiste seulement)
router.delete("/:id", authMiddleware, authorizeRoles("dentiste"), deleteSecretaire);

export default router;

//Dans Express, les routes plus longues ou spécifiques vont avant les routes plus courtes ou génériques. Sinon, la route générique “vole” le match.
