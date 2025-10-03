import express from "express";
import { createPatient, deletePatient, getPatients, getPatientsBySecretaireConnecte, updatePatient } from "../controllers/patientController.js";
import { authenticateToken } from "./AuthRoutes.js";


const router = express.Router();

// --- Middlewares ---
const requireSecretaire = (req, res, next) => {
    if (!req.user || req.user.role !== 'secretaire') {
        return res.status(403).json({ error: 'Accès secretaire requis' });
    }
    next();
};

router.use(authenticateToken);
router.use(requireSecretaire);


router.get("/patients", getPatientsBySecretaireConnecte);

router.post("/patients", createPatient);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);



export default router;

