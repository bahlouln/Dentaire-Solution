import RendezVous from "../models/RendezVous.js";
import Patient from "../models/Patient.js";
import Dentiste from "../models/Dentiste.js";
// 📋 Récupérer tous les rendez-vous
export const getRendezVous = async (req, res) => {
  try {
    const rendezVous = await RendezVous.findAll({
      include: [Patient, Dentiste],
    });
    res.json(rendezVous);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des rendez-vous", error });
  }
};

// 🔍 Récupérer un rendez-vous par ID
export const getRendezVousById = async (req, res) => {
  try {
    const rdv = await RendezVous.findByPk(req.params.id, { include: [Patient, Dentiste] });
    if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });
    res.json(rdv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du rendez-vous", error });
  }
};

// ➕ Créer un rendez-vous
export const createRendezVous = async (req, res) => {
  try {
    const { patientId, dentisteId, dateDebut, dateFin, note } = req.body;

    if (!patientId || !dentisteId || !dateDebut || !dateFin) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const newRdv = await RendezVous.create({
      patientId,
      dentisteId,
      dateDebut,
      dateFin,
      note: note || null,
    });

    res.status(201).json(newRdv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la création du rendez-vous", error });
  }
};

// ✏️ Modifier un rendez-vous
export const updateRendezVous = async (req, res) => {
  try {
    const rdv = await RendezVous.findByPk(req.params.id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    await rdv.update(req.body);
    res.json(rdv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du rendez-vous", error });
  }
};

// ❌ Supprimer un rendez-vous
export const deleteRendezVous = async (req, res) => {
  try {
    const rdv = await RendezVous.findByPk(req.params.id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    await rdv.destroy();
    res.json({ message: "Rendez-vous supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du rendez-vous", error });
  }
};
