import Secretaire from "../models/Secretaire.js";
import { createUserGeneric, updateUser, deleteUser } from "./UserController.js";

// ➕ Créer une secrétaire
export const createSecretaire = async (req, res) => {
  try {
    const { nom, email, motDePasse, bureau, dentisteId } = req.body;

    // Créer un user avec rôle secretaire
    const newUser = await createUserGeneric({ nom, email, motDePasse, role: "secretaire" });

    const newSecretaire = await Secretaire.create({
      userId: newUser.id,
      bureau: bureau || null,
      dentisteId,
    });

    res.status(201).json({ user: newUser, secretaire: newSecretaire });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la création de la secrétaire", error: error.message });
  }
};

// 📋 Récupérer toutes les secrétaires
export const getSecretaires = async (req, res) => {
  try {
    const secretaires = await Secretaire.findAll({ include: "User" });
    res.json(secretaires);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔍 Récupérer une secrétaire par ID
export const getSecretaireById = async (req, res) => {
  try {
    const secretaire = await Secretaire.findByPk(req.params.id, { include: "User" });
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

    // Update du user associé
    req.params.id = secretaire.userId;
    await updateUser(req, res);

    // Update bureau
    if (req.body.bureau) {
      await secretaire.update({ bureau: req.body.bureau });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ❌ Supprimer une secrétaire
export const deleteSecretaire = async (req, res) => {
  try {
    const secretaire = await Secretaire.findByPk(req.params.id);
    if (!secretaire) return res.status(404).json({ message: "Secrétaire non trouvée" });

    req.params.id = secretaire.userId;
    await deleteUser(req, res);

    await secretaire.destroy();
    res.json({ message: "Secrétaire supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
