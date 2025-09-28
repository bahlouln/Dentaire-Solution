import Patient from "../models/Patient.js";
import Dentiste from "../models/Dentiste.js";
import Secretaire from "../models/Secretaire.js";
import User from "../models/User.js";

// ➕ Créer un patient pour le dentiste connecté
export const createPatient = async (req, res) => {
  try {
    const dentiste = await Dentiste.findOne({ where: { userId: req.user.id } });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    const patient = await Patient.create({
      ...req.body,
      dentisteId: dentiste.id,
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

// ➕ Créer un patient lié à un dentiste spécifique
export const createPatientByDentiste = async (req, res) => {
  try {
    const { dentisteId } = req.params;
    const dentiste = await Dentiste.findByPk(dentisteId);
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    const patient = await Patient.create({
      ...req.body,
      dentisteId,
    });

    res.status(201).json({
      message: "Patient créé pour ce dentiste avec succès",
      patient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création du patient pour ce dentiste",
      error: error.message,
    });
  }
};

// 📋 Récupérer les patients du dentiste connecté
export const getPatientsByDentisteConnecte = async (req, res) => {
  try {
    // Récupérer le dentiste connecté via req.user.id
    const dentiste = await Dentiste.findOne({ where: { userId: req.user.id } });

    if (!dentiste) {
      return res.status(404).json({ message: "Dentiste non trouvé" });
    }

    // Récupérer tous les patients liés à ce dentiste
    const patients = await Patient.findAll({
      where: { dentisteId: dentiste.id },
      // tu peux inclure d'autres modèles si nécessaire, par ex. rendez-vous
      // include: [{ model: RendezVous }] 
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

// 📋 Récupérer tous les patients
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [{ model: Dentiste }], // ne pas préciser d'attributs inexistants
    });

    res.json({
      message: "Liste des patients récupérée",
      patients,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des patients",
      error: error.message,
    });
  }
};

// 📋 Récupérer tous les patients d’un dentiste
export const getPatientsByDentiste = async (req, res) => {
  try {
    const { dentisteId } = req.params;
    const dentiste = await Dentiste.findByPk(dentisteId, {
      include: [{ model: Patient }],
    });

    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    res.json({
      message: "Patients du dentiste récupérés",
      patients: dentiste.Patients || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des patients du dentiste",
      error: error.message,
    });
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
