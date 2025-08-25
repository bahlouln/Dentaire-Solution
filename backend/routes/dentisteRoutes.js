import express from "express";
import {
  createDentiste,
  getDentistes,
  getDentisteById,
  updateDentiste,
  deleteDentiste,
} from "../controllers/DentisteController.js";

const router = express.Router();

// Routes
router.post("/", createDentiste);        // ➕ Ajouter dentiste
router.get("/", getDentistes);          // 📋 Liste dentistes
router.get("/:id", getDentisteById);    // 🔍 Un dentiste
router.put("/:id", updateDentiste);     // ✏️ Modifier
router.delete("/:id", deleteDentiste);  // ❌ Supprimer

export default router;
