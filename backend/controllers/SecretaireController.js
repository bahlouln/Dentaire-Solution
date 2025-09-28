import Secretaire from "../models/Secretaire.js";
import User from "../models/User.js";
import { createUserGeneric, updateUser, deleteUser } from "./UserController.js";

// ➕ Créer une secrétaire
export const createSecretaire = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;


    // 2️⃣ Créer un user avec rôle secretaire
    const newUser = await createUserGeneric({
      nom,
      email,
      motDePasse,
      role: "secretaire",
    });

    // 3️⃣ Créer la secrétaire liée au dentiste connecté
    const newSecretaire = await Secretaire.create({
      userId: newUser.id,
      dentisteId: req.user.dentiste.id, 
    });

    res
      .status(201)
      .json({ message: "Secrétaire créée avec succès", user: newUser, secretaire: newSecretaire });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la création de la secrétaire",
        error: error.message,
      });
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

// 📋 Récupérer les secrétaires du dentiste connecté
export const getSecretaires = async (req, res) => {
  try {


    const secretaires = await Secretaire.findAll({
      where: { dentisteId: req.user.dentisteId },
      include: [{ model: User, attributes: ["id", "nom", "email", "role"] }],
    });

    if (!secretaires || secretaires.length === 0) {
      return res.status(200).json({ message: "Aucune secrétaire trouvée pour ce dentiste", secretaires: [] });
    }

    res.status(200).json(secretaires);
  } catch (error) {
    console.error("Erreur getSecretairesByDentiste :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


