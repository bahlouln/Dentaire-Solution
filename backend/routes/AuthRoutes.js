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



export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    jwt.verify(token, JWT_SECRET, (err, user) => {   // ✅ même secret qu’à la signature
        if (err) return res.status(403).json({ error: 'Token invalide' });
        req.user = user;
        next();
    });
};
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
export default router;
