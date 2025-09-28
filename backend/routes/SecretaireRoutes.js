import express from "express";
import { createPatient, deletePatient, getPatients, updatePatient } from "../controllers/patientController.js";
import { createRendezVous, deleteRendezVous, getRendezVous, updateRendezVous } from "../controllers/RendezVousController.js";
import { authenticateToken } from "./AuthRoutes.js";
import Dentiste from '../models/Dentiste.js';

const router = express.Router();

// --- Middlewares ---
const requireSecretaire = (req, res, next) => {
    if (!req.user || req.user.role !== 'secretaire') {
        return res.status(403).json({ error: 'Accès secretaire requis' });
    }
    next();
};




export const attachDentisteFromSec = async (req, res, next) => {
    try {
        if (req.user?.role !== 'secretaire') {
            return res.status(403).json({ error: 'Accès secretaire requis' });
        }
        const dentiste = await Dentiste.findOne({ where: { userId: req.user.secretaire.dentisteId } });
        if (!dentiste) return res.status(404).json({ error: 'Profil dentiste introuvable' });
        req.dentiste = dentiste;
        next();
    } catch (e) {
        next(e);
    }
};



router.use(authenticateToken);
router.use(requireSecretaire);
router.use(attachDentisteFromSec);
router.post("/patients", createPatient);
router.get("/patients", getPatients);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);


router.get("/rendezvous", getRendezVous);
router.post("/rendezvous", createRendezVous);
router.put("/rendezvous/:id", updateRendezVous);
router.delete("/rendezvous/:id", deleteRendezVous);
export default router;

