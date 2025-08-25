import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;

    const user = await User.create({ nom, email, motDePasse, role });

    res.status(201).json({ message: "Utilisateur créé", user });
  } catch (err) {
    res.status(400).json({ message: "Erreur inscription", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "SECRET_KEY", // ⚠️ mets une vraie clé secrète dans .env
      { expiresIn: "1d" }
    );

    res.json({ message: "Connexion réussie", token, user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
