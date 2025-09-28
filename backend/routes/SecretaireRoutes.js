import express from "express";
import { createPatient, deletePatient, getPatients, updatePatient } from "../controllers/patientController.js";
import { createRendezVous, createRendezVousSecretaire, deleteRendezVous, getRendezVous, updateRendezVous } from "../controllers/RendezVousController.js";
import { authenticateToken } from "./AuthRoutes.js";
import Dentiste from '../models/Dentiste.js';
import Secretaire from "../models/Secretaire.js";

const router = express.Router();

// --- Middlewares ---
const requireSecretaire = (req, res, next) => {
    if (!req.user || req.user.role !== 'secretaire') {
        return res.status(403).json({ error: 'Accès secretaire requis' });
    }
    next();
};




export const attachSecretaireAndDentiste = async (req, res, next) => {
    try {

        const secretaire = await Secretaire.findOne({
            where: { userId: req.user.userId },
        });
        if (!secretaire) {
            return res.status(404).json({ error: "Profil secrétaire introuvable" });
        }

        const dentisteId = secretaire.dentisteId ?? secretaire.DentisteId;
        if (!dentisteId) {
            return res.status(400).json({ error: "Secrétaire sans dentiste lié" });
        }

        // si pas d'include plus haut :
        const dentiste = await Dentiste.findByPk(dentisteId);
        if (!dentiste) {
            return res.status(404).json({ error: "Profil dentiste introuvable" });
        }

        // exposer sur req
        req.secretaire = secretaire;
        req.dentiste = dentiste;

        next();
    } catch (e) {
        next(e);
    }
};


router.use(authenticateToken);
router.use(requireSecretaire);
router.use(attachSecretaireAndDentiste);
router.post("/patients", createPatient);
router.get("/patients", getPatients);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);


router.get("/rendezvous", getRendezVous);
router.post("/rendezvous", createRendezVousSecretaire);
router.put("/rendezvous/:id", updateRendezVous);
router.delete("/rendezvous/:id", deleteRendezVous);
export default router;

