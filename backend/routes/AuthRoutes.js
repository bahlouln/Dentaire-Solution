import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";      
import Dentiste from "../models/Dentiste.js"; 

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

function pickPasswordField(user) {
  return user.motDePasse ?? user.passwordHash ?? user.password ?? user.dataValues?.motDePasse ?? user.dataValues?.passwordHash ?? user.dataValues?.password;
}

// Utilitaire: construit le payload en ajoutant dentisteId si role = 'dentiste'
async function buildJwtPayload(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  if (user.role === "dentiste") {
    const dent = await Dentiste.findOne({ where: { userId: user.id } });
    if (dent) {
      payload.dentisteId = dent.id; 
    }
  }
  return payload;
}

// --------- Login DENTISTE ---------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const dbHash = pickPasswordField(user);
    if (!dbHash) return res.status(500).json({ error: "Mot de passe introuvable côté serveur" });

    const ok = await bcrypt.compare(password, dbHash);
    if (!ok) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    if (user.isActive === false) return res.status(401).json({ error: "Compte désactivé" });

    const payload = await buildJwtPayload(user);
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        ...(payload.dentisteId ? { dentisteId: payload.dentisteId } : {}),
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

    const user = await User.findOne({ where: { email: email.toLowerCase(), role: "admin" } });
    if (!user) return res.status(401).json({ error: "Accès admin refusé" });

    const dbHash = pickPasswordField(user);
    if (!dbHash) return res.status(500).json({ error: "Mot de passe introuvable côté serveur" });

    const ok = await bcrypt.compare(password, dbHash);
    if (!ok) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

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

// --------- Middleware Auth JWT ---------
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });
    req.user = user; // { userId, email, role, [dentisteId] }
    next();
  });
};

export default router;
