import express from "express";

import { createPatient, deletePatient, getPatients,updatePatient } from "../controllers/patientController.js";
import { createSecretaire, deleteSecretaire, getSecretaires,  updateSecretaire } from "../controllers/SecretaireController.js";
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


router.post("/patients", createPatient);
router.get("/patients", getPatients);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);




router.get("/secretaires",getSecretaires);
router.post("/secretaires", createSecretaire);
router.put("/secretaires/:id",  updateSecretaire);
router.delete("/secretaires/:id", deleteSecretaire);







export default router;
