// routes/admin.js
import { authenticateToken } from './AuthRoutes.js';
import { Router } from "express";
import {
    createDentiste,
    getDentistes,
    getDentisteById,
    updateDentiste,
    deleteDentiste,
    getDentisteSecretaires,
} from "../controllers/DentisteController.js"; // adapte le chemin si besoin
const router = Router();




// --- Middlewares ---
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès admin requis' });
    }
    next();
};



router.use(authenticateToken);
router.use(requireAdmin);


// ---- Dentistes ----
router.post("/dentistes", createDentiste);
router.get("/dentistes", getDentistes);
router.get("/dentistes/:id", getDentisteById);
router.put("/dentistes/:id", updateDentiste);        
router.delete("/dentistes/:id", deleteDentiste);

// (optionnel) secrétaires d’un dentiste
router.get("/dentistes/:id/secretaires", getDentisteSecretaires);

export default router;
