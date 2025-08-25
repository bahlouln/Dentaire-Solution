import Secretaire from "../models/Secretaire.js";
import User from "../models/User.js";

// ➕ Créer une secrétaire (avec user associé)
export const createSecretaire = async (req, res) => {
  try {
    const { nom, email, motDePasse, bureau } = req.body;
    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // Créer l'utilisateur
    const newUser = await User.create({ nom, email, motDePasse, role: "secretaire" });

    // Créer la secrétaire liée
    const newSecretaire = await Secretaire.create({ userId: newUser.id, bureau: bureau || null });

    res.status(201).json({ user: newUser, secretaire: newSecretaire });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la création de la secrétaire", error });
  }
};

// 📋 Récupérer toutes les secrétaires
export const getSecretaires = async (req, res) => {
  try {
    const secretaires = await Secretaire.findAll({ include: User });
    res.json(secretaires);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔍 Récupérer une secrétaire par ID
export const getSecretaireById = async (req, res) => {
  try {
    const secretaire = await Secretaire.findByPk(req.params.id, { include: User });
    if (!secretaire) return res.status(404).json({ message: "Secrétaire non trouvée" });
    res.json(secretaire);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✏️ Modifier une secrétaire
export const updateSecretaire = async (req, res) => {
  try {
    const secretaire = await Secretaire.findByPk(req.params.id);
    if (!secretaire) return res.status(404).json({ message: "Secrétaire non trouvée" });

    await secretaire.update(req.body);
    res.json(secretaire);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ❌ Supprimer une secrétaire
export const deleteSecretaire = async (req, res) => {
  try {
    const secretaire = await Secretaire.findByPk(req.params.id);
    if (!secretaire) return res.status(404).json({ message: "Secrétaire non trouvée" });

    await secretaire.destroy();
    res.json({ message: "Secrétaire supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
