import express from "express";
import {
  createDiagnostique,
  getDiagnostiquesByPatient,
  getDiagnostiqueById,
  updateDiagnostique,
  deleteDiagnostique,
} from "../controllers/DiagnostiqueController.js";
import { authenticateToken } from "./AuthRoutes.js";

const router = express.Router();

// --- Middlewares ---
const requireDentiste = (req, res, next) => {
    if (!req.user || req.user.role !== 'dentiste') {
        return res.status(403).json({ error: 'Accès dentiste requis' });
    }
    next();
};


router.use(authenticateToken);
router.use(requireDentiste);


router.post("/", createDiagnostique);
router.get("/patient/:patientId", getDiagnostiquesByPatient);
router.get("/:id", getDiagnostiqueById);
router.put("/:id", updateDiagnostique);
router.delete("/:id", deleteDiagnostique);

export default router;
