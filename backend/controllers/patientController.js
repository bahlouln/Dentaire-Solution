import Patient from "../models/Patient.js";

// ➕ Créer un patient
export const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du patient", error });
  }
};

// 📋 Récupérer tous les patients
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des patients", error });
  }
};

// 🔍 Récupérer un patient par ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du patient", error });
  }
};

// ✏️ Modifier un patient
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });

    await patient.update(req.body);
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du patient", error });
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
    res.status(500).json({ message: "Erreur lors de la suppression du patient", error });
  }
};
