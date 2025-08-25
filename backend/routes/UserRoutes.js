import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/UserController.js";

const router = express.Router();

// Routes
router.post("/", createUser);      // ➕ Ajouter utilisateur
router.get("/", getUsers);         // 📋 Liste utilisateurs
router.get("/:id", getUserById);   // 🔍 Un utilisateur
router.put("/:id", updateUser);    // ✏️ Modifier
router.delete("/:id", deleteUser); // ❌ Supprimer

export default router;
