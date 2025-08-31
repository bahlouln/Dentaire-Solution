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
router.use(authMiddleware); // toutes les routes nécessitent authentification

router.get("/", getRendezVous);
router.get("/:id", getRendezVousById);
router.post("/", createRendezVous);
router.put("/:id", updateRendezVous);
router.delete("/:id", deleteRendezVous);
export default router;
