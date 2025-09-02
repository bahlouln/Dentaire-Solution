import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";
import {
  createDentiste,
  getDentistes,
  getDentisteById,
  updateDentiste,
  deleteDentiste,
  getDentisteSecretaires,
} from "../controllers/DentisteController.js";
const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("admin")); // ← Seul l'admin peut continuer


// Routes
//router.post("/", authMiddleware, authorizeRoles("admin"), createDentiste);
router.post("/", createDentiste);        // ➕ Ajouter dentiste
router.get("/", getDentistes);          // 📋 Liste dentistes
router.get("/:id", getDentisteById);    // 🔍 Un dentiste
router.put("/:id", updateDentiste);     // ✏️ Modifier
router.delete("/:id", deleteDentiste);  // ❌ Supprimer
router.get("/:id/secretaires", getDentisteSecretaires); 

export default router;
