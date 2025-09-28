import express from "express";

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
router.post("/", createSecretaire);

// 📋 Liste des secrétaires du dentiste connecté
router.get(
  "/dentiste",
  getSecretairesByDentiste
);

// 📋 Liste secrétaires (admin seulement)
router.get("/",  getSecretaires);

// 🔍 Une secrétaire par ID (admin seulement)
router.get("/:id",  getSecretaireById);

// ✏️ Modifier une secrétaire (dentiste seulement)
router.put("/:id",  updateSecretaire);

// ❌ Supprimer une secrétaire (dentiste seulement)
router.delete("/:id", deleteSecretaire);

export default router;

//Dans Express, les routes plus longues ou spécifiques vont avant les routes plus courtes ou génériques. Sinon, la route générique “vole” le match.
