import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 🔑 Connexion
export const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Vérification du mot de passe
const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
console.log("Mot de passe reçu :", motDePasse);
console.log("Hash en DB :", user.motDePasse);
console.log("Résultat bcrypt.compare :", isMatch);
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
