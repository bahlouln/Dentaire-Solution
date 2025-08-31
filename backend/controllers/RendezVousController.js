import RendezVous from "../models/RendezVous.js";
import Patient from "../models/Patient.js";
import Dentiste from "../models/Dentiste.js";

// 📋 Liste tous les rendez-vous du dentiste connecté
export const getRendezVous = async (req, res) => {
  try {
    const rendezVous = await RendezVous.findAll({
      where: { dentisteId: req.user.id },
      include: [Patient, Dentiste],
    });
    res.json(rendezVous);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔍 Récupérer un rendez-vous par ID
export const getRendezVousById = async (req, res) => {
  try {
    const rdv = await RendezVous.findByPk(req.params.id, {
      include: [Patient, Dentiste],
    });
    if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });
    // Sécuriser : ne retourner que si c’est le dentiste connecté
    if (rdv.dentisteId !== req.user.id) return res.status(403).json({ message: "Non autorisé" });

    res.json(rdv);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ➕ Créer un rendez-vous
export const createRendezVous = async (req, res) => {
  try {
    const { patientId, dateDebut, dateFin, note } = req.body;

    if (!patientId || !dateDebut || !dateFin) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const newRdv = await RendezVous.create({
      patientId,
      dentisteId: req.user.id,
      dateDebut,
      dateFin,
      note: note || null,
    });

    res.status(201).json(newRdv);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✏️ Mettre à jour un rendez-vous
export const updateRendezVous = async (req, res) => {
  try {
    const rdv = await RendezVous.findByPk(req.params.id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });
    if (rdv.dentisteId !== req.user.id) return res.status(403).json({ message: "Non autorisé" });

    await rdv.update(req.body);
    res.json(rdv);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ❌ Supprimer un rendez-vous
export const deleteRendezVous = async (req, res) => {
  try {
    const rdv = await RendezVous.findByPk(req.params.id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });
    if (rdv.dentisteId !== req.user.id) return res.status(403).json({ message: "Non autorisé" });

    await rdv.destroy();
    res.json({ message: "Rendez-vous supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
