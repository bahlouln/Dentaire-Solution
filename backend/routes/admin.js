// routes/admin.js
import { Router } from "express";
import {
    createDentiste,
    getDentistes,
    getDentisteById,
    updateDentiste,
    deleteDentiste,
    getDentisteSecretaires,
} from "../controllers/DentisteController.js"; // adapte le chemin si besoin

// (optionnel mais recommandé) middlewares d’auth/role
import jwt from "jsonwebtoken";

const router = Router();

// --- middlewares basiques ---
function authenticateJWT(req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Token manquant" });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { userId, email, role }
        next();
    } catch (e) {
        return res.status(401).json({ error: "Token invalide" });
    }
}
function requireRole(role) {
    return (req, res, next) => {
        if (req.user?.role !== role) return res.status(403).json({ error: "Accès refusé" });
        next();
    };
}

// Toutes les routes admin sont protégées
router.use(authenticateJWT, requireRole("admin"));

// ---- Dentistes ----
router.post("/dentistes", createDentiste);
router.get("/dentistes", getDentistes);
router.get("/dentistes/:id", getDentisteById);
router.put("/dentistes/:id", updateDentiste);        // si tu veux exposer la MAJ
router.delete("/dentistes/:id", deleteDentiste);

// (optionnel) secrétaires d’un dentiste
router.get("/dentistes/:id/secretaires", getDentisteSecretaires);

export default router;
