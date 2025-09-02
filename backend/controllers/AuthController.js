import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Dentiste from "../models/Dentiste.js";
import Secretaire from "../models/Secretaire.js";

// Fonction générique pour créer un utilisateur (simple création, pas de hash ici)
export const createUserGeneric = async ({ nom, email, motDePasse, role }) => {
  return await User.create({ nom, email, motDePasse, role });
};

// ➕ Inscription
export const register = async (req, res) => {
  try {
    const { nom, email, motDePasse, role, specialite, bureau, dentisteId } = req.body;

    if (!nom || !email || !motDePasse || !role) {
      return res.status(400).json({ message: "Tous les champs requis" });
    }

    // 1️⃣ Créer le user (hash automatique via hook beforeCreate)
    const newUser = await createUserGeneric({ nom, email, motDePasse, role });

    // 2️⃣ Créer l’entrée spécifique selon le rôle
    let infoSpecifique = null;
    if (role === "dentiste") {
      infoSpecifique = await Dentiste.create({
        userId: newUser.id,
        specialite: specialite || null,
      });
    } else if (role === "secretaire") {
      infoSpecifique = await Secretaire.create({
        userId: newUser.id,
        bureau: bureau || null,
        dentisteId: dentisteId || null,
      });
    }

    // 3️⃣ Retourner user + info métier
    res.status(201).json({ user: newUser, details: infoSpecifique });
  } catch (err) {
    res.status(500).json({ message: "Erreur inscription", error: err.message });
  }
};

// 🔑 Connexion
export const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Vérification du mot de passe (hash stocké correct grâce au hook)
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    // Création du token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({ message: "Connexion réussie", token, user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
