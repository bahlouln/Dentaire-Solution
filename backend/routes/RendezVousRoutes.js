import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js"; // 👈 importer middleware
import authorizeRoles from "../middlewares/roleMiddleware.js";
import {
  getRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVous,
  deleteRendezVous,
  getRendezVousByDentiste,
} from "../controllers/RendezVousController.js";

//seuls les utilisateurs connectés puissent gérer les rendez-vous.
const router = express.Router();
router.use(authMiddleware); // toutes les routes nécessitent authentification
router.use(authorizeRoles("secretaire","dentiste"));
router.get("/", getRendezVous);
router.get("/:id", getRendezVousById);
router.post("/", createRendezVous);
router.put("/:id", updateRendezVous);
router.delete("/:id", deleteRendezVous);
// au lieu de /dentistes/:dentisteId/rendezvous
router.get("/dentiste/:dentisteId", getRendezVousByDentiste);
export default router;
