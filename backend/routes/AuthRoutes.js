import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // Sequelize model

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

function pickPasswordField(user) {
    return user.motDePasse ?? user.passwordHash ?? user.password;
}

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Sequelize: where:{}
        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

        const dbHash = pickPasswordField(user);
        const ok = await bcrypt.compare(password, dbHash);
        if (!ok) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

        // isActive facultatif (si le champ n'existe pas, on ignore)
        if (user.isActive === false) return res.status(401).json({ error: "Compte désactivé" });

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Erreur login:", error);
        return res.status(500).json({ error: "Erreur serveur", details: error.message });
    }
});

// --------- Login ADMIN ---------
router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Sequelize: where:{ email, role:'admin' }
        const user = await User.findOne({ where: { email: email.toLowerCase(), role: "admin" } });
        if (!user) return res.status(401).json({ error: "Accès admin refusé" });

        const dbHash = pickPasswordField(user);
        const ok = await bcrypt.compare(password, dbHash);
        if (!ok) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Erreur admin login:", error);
        return res.status(500).json({ error: "Erreur serveur", details: error.message });
    }
});

export default router;
