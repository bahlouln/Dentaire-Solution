import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // ← n'oublie pas ça

// ➕ Inscription
export const register = async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;

    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Crée l'utilisateur (le hook beforeCreate va hash le motDePasse)
    const user = await User.create({
      nom,
      email,
      motDePasse, // PAS de hash ici
      role
    });

    res.status(201).json({ message: "Utilisateur créé", user });
  } catch (err) {
    res.status(400).json({ message: "Erreur inscription", error: err.message });
  }
};

// 🔑 Connexion
export const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Vérification du mot de passe
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
