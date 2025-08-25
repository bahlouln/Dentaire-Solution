import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// ➕ Créer un utilisateur
export const createUser = async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;
    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const newUser = await User.create({ nom, email, motDePasse, role: role || "dentiste" });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur", error });
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
