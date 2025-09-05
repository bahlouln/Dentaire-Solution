import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Fonction générique de création d'utilisateur
export const createUserGeneric = async ({ nom, email, motDePasse, role }) => {
  if (!nom || !email || !motDePasse) {
    throw new Error("Champs requis manquants");
  }

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(motDePasse, 10);

  const newUser = await User.create({
    nom,
    email,
    motDePasse,
    role: role || "dentiste",
  });

  return newUser;
};

// ➕ Créer un utilisateur (API)
export const createUser = async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;
    const newUser = await createUserGeneric({ nom, email, motDePasse, role });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur", error: error.message });
  }
};

// 📋 Récupérer tous les utilisateurs
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error });
  }
};

// 🔍 Récupérer un utilisateur par ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur", error });
  }
};

// ✏️ Modifier un utilisateur
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Si motDePasse modifié → rehash
    if (req.body.motDePasse) {
      req.body.motDePasse = await bcrypt.hash(req.body.motDePasse, 10);
    }

    await user.update(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error });
  }
};

// ❌ Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    await user.destroy();
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur", error });
  }
};
