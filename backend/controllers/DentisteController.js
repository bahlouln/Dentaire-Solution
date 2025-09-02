
import Dentiste from "../models/Dentiste.js";
import Secretaire from "../models/Secretaire.js";
import User from "../models/User.js";
import { createUserGeneric, updateUser, deleteUser, getUserById } from "./UserController.js";

// ➕ Créer un dentiste
export const createDentiste = async (req, res) => {
  try {
    const { nom, email, motDePasse, specialite } = req.body;

    // Créer l'utilisateur avec rôle dentiste
    const newUser = await createUserGeneric({ nom, email, motDePasse, role: "dentiste" });

    // Associer un enregistrement dentiste
    const newDentiste = await Dentiste.create({
      userId: newUser.id,
      specialite: specialite || null,
    });

    res.status(201).json({ User: newUser, dentiste: newDentiste });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la création du dentiste", error: error.message });
  }
};

// 📋 Récupérer tous les dentistes
export const getDentistes = async (req, res) => {
  try {
    const dentistes = await Dentiste.findAll({ include: "User" });
    res.json(dentistes);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des dentistes", error });
  }
};

// 🔍 Récupérer un dentiste par ID
export const getDentisteById = async (req, res) => {
  try {
    const dentiste = await Dentiste.findByPk(req.params.id, { include: "User" });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });
    res.json(dentiste);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération du dentiste", error });
  }
};

// ✏️ Modifier un dentiste (utilisateur + spécialité)
export const updateDentiste = async (req, res) => {
  try {
    const dentiste = await Dentiste.findByPk(req.params.id);
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    // Update user associé
    req.params.id = dentiste.userId; // on force updateUser à utiliser l'id du user
    await updateUser(req, res);

    // Update spécialité
    if (req.body.specialite) {
      await dentiste.update({ specialite: req.body.specialite });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du dentiste", error });
  }
};

// ❌ Supprimer un dentiste (supprime aussi le user)
export const deleteDentiste = async (req, res) => {
  try {
    const dentiste = await Dentiste.findByPk(req.params.id);
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    req.params.id = dentiste.userId;
    await deleteUser(req, res);

    await dentiste.destroy();
    res.json({ message: "Dentiste supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du dentiste", error });
  }};

//avoir toutes les secrétaires d’un dentiste :
export const getDentisteSecretaires = async (req, res) => {
  try {
    const dentiste = await Dentiste.findByPk(req.params.id, {
      include: [{ model: Secretaire, include: [User] }],
    });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });
    console.log("Dentiste Secretaires:", dentiste.Secretaires);
    res.json(dentiste.Secretaires);
  } catch (error) {
    console.error("Error fetching secretaries:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des secrétaires", error: error.message });
  }
};


