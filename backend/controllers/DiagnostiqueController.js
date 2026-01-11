import Diagnostique from "../models/Diagnostique.js";
import Patient from "../models/Patient.js";
import Dentiste from "../models/Dentiste.js";

// ➕ Créer un nouveau diagnostique pour un patient
export const createDiagnostique = async (req, res) => {
  try {
    const { patientId, description, date } = req.body;

    // Vérifier que le patient existe
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Créer le diagnostique
    const diagnostique = await Diagnostique.create({
      patientId,
      description,
      date: date || new Date(),
    });

    res.status(201).json({
      message: "✅ Diagnostique créé avec succès",
      diagnostique,
    });
  } catch (error) {
    console.error("Erreur createDiagnostique :", error);
    res.status(500).json({
      message: "Erreur lors de la création du diagnostique",
      error: error.message,
    });
  }
};

// 📋 Récupérer tous les diagnostiques d’un patient
export const getDiagnostiquesByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findByPk(patientId, {
      include: [{ model: Diagnostique }],
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.status(200).json({
      message: "✅ Diagnostiques récupérés avec succès",
      diagnostiques: patient.Diagnostiques,
    });
  } catch (error) {
    console.error("Erreur getDiagnostiquesByPatient :", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des diagnostiques",
      error: error.message,
    });
  }
};

// 🔍 Récupérer un diagnostique par ID
export const getDiagnostiqueById = async (req, res) => {
  try {
    const diagnostique = await Diagnostique.findByPk(req.params.id, {
      include: [{ model: Patient, include: [Dentiste] }],
    });

    if (!diagnostique) {
      return res.status(404).json({ message: "Diagnostique non trouvé" });
    }

    res.status(200).json({
      message: "Diagnostique récupéré avec succès",
      diagnostique,
    });
  } catch (error) {
    console.error("Erreur getDiagnostiqueById :", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du diagnostique",
      error: error.message,
    });
  }
};

// ✏️ Modifier un diagnostique
export const updateDiagnostique = async (req, res) => {
  try {
    const diagnostique = await Diagnostique.findByPk(req.params.id);
    if (!diagnostique) {
      return res.status(404).json({ message: "Diagnostique non trouvé" });
    }

    await diagnostique.update(req.body);

    res.status(200).json({
      message: "Diagnostique mis à jour avec succès",
      diagnostique,
    });
  } catch (error) {
    console.error("Erreur updateDiagnostique :", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du diagnostique",
      error: error.message,
    });
  }
};

// ❌ Supprimer un diagnostique
export const deleteDiagnostique = async (req, res) => {
  try {
    const diagnostique = await Diagnostique.findByPk(req.params.id);
    if (!diagnostique) {
      return res.status(404).json({ message: "Diagnostique non trouvé" });
    }

    await diagnostique.destroy();

    res.status(200).json({
      message: "Diagnostique supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteDiagnostique :", error);
    res.status(500).json({
      message: "Erreur lors de la suppression du diagnostique",
      error: error.message,
    });
  }
};
