import Patient from "../models/Patient.js";
import Dentiste from "../models/Dentiste.js";
import Secretaire from "../models/Secretaire.js";
import User from "../models/User.js";

// ➕ Créer un patient pour le dentiste connecté
export const createPatient = async (req, res) => {
  try {
    
    const patient = await Patient.create({
      ...req.body,
      dentisteId: req.user.dentisteId, 
    });

    res.status(201).json({
      message: "Patient créé avec succès",
      patient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création du patient",
      error: error.message,
    });
  }
};

// 📋 Récupérer les patients du dentiste connecté
export const getPatients = async (req, res) => {
  try {
    

    // Récupérer tous les patients liés à ce dentiste
    const patients = await Patient.findAll({
      where: { dentisteId: req.user.dentisteId},
    });

    if (!patients || patients.length === 0) {
      return res.status(200).json({ message: "Aucun patient trouvé pour ce dentiste", patients: [] });
    }

    res.status(200).json({ message: "Patients récupérés avec succès", patients });
  } catch (error) {
    console.error("Erreur getPatientsByDentisteConnecte :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// 📋 Récupérer les patients via une secrétaire connectée

export const getPatientsBySecretaireConnecte = async (req, res) => {
  try {
    // 1️⃣ Trouver la secrétaire connectée
    const secretaire = await Secretaire.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: Dentiste,
          include: [{ model: User, attributes: ["id", "nom", "email"] }],
        },
      ],
    });

    if (!secretaire) {
      return res.status(404).json({ message: "Secrétaire non trouvée" });
    }

    // 2️⃣ Récupérer les patients du dentiste associé
    const patients = await Patient.findAll({
      where: { dentisteId: secretaire.dentisteId },
      include: [
        {
          model: Dentiste,
          attributes: ["id", "specialite"],
          include: [{ model: User, attributes: ["id", "nom", "email"] }],
        },
      ],
    });

    if (!patients.length) {
      return res.status(200).json({ message: "Aucun patient trouvé pour ce dentiste", patients: [] });
    }

    res.status(200).json({
      message: "✅ Patients récupérés avec succès",
      patients,
    });
  } catch (error) {
    console.error("Erreur getPatientsBySecretaireConnecte :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// 🔍 Récupérer un patient par ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [{ model: Dentiste }],
    });
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });

    res.json({
      message: "Patient récupéré avec succès",
      patient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération du patient",
      error: error.message,
    });
  }
};

// ✏️ Modifier un patient
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });

    await patient.update(req.body);
    res.json({
      message: "Patient mis à jour avec succès",
      patient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du patient",
      error: error.message,
    });
  }
};

// ❌ Supprimer un patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });

    await patient.destroy();
    res.json({ message: "Patient supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression du patient",
      error: error.message,
    });
  }
};
export const getPatientsAnnualStats = async (req, res) => {
  try {
    const data = await Patient.findAll({
      attributes: [
        // extraire l'année de la date de création
        [Patient.sequelize.fn("YEAR", Patient.sequelize.col("createdAt")), "annee"],
        // compter le nombre de patients
        [Patient.sequelize.fn("COUNT", Patient.sequelize.col("id")), "total"],
      ],
      group: ["annee"],
      order: [["annee", "ASC"]],
    });

    res.json(data);
  } catch (error) {
    console.error("Erreur getPatientsAnnual :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
