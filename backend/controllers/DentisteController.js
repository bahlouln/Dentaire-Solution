import Dentiste from "../models/Dentiste.js";
import User from "../models/User.js";

// ➕ Créer un dentiste (avec user associé)
export const createDentiste = async (req, res) => {
  try {
    const { nom, email, motDePasse, specialite } = req.body;

    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // Créer l'utilisateur
    const newUser = await User.create({
      nom,
      email,
      motDePasse,
      role: "dentiste",
    });

    // Créer le dentiste lié à cet utilisateur
    const newDentiste = await Dentiste.create({
      userId: newUser.id,
      specialite: specialite || null,
    });

    res.status(201).json({ user: newUser, dentiste: newDentiste });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la création du dentiste", error });
  }
};

// 📋 Récupérer tous les dentistes
export const getDentistes = async (req, res) => {
  try {
    const dentistes = await Dentiste.findAll({ include: User });
    res.json(dentistes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des dentistes", error });
  }
};

// 🔍 Récupérer un dentiste par ID
export const getDentisteById = async (req, res) => {
  try {
    const dentiste = await Dentiste.findByPk(req.params.id, { include: User });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });
    res.json(dentiste);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du dentiste", error });
  }
};

// ✏️ Modifier un dentiste
export const updateDentiste = async (req, res) => {
  try {
    const dentiste = await Dentiste.findByPk(req.params.id);
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    await dentiste.update(req.body);
    res.json(dentiste);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du dentiste", error });
  }
};

// ❌ Supprimer un dentiste
export const deleteDentiste = async (req, res) => {
  try {
    const dentiste = await Dentiste.findByPk(req.params.id);
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    await dentiste.destroy();
    res.json({ message: "Dentiste supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du dentiste", error });
  }
};
