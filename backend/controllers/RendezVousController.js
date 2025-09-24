import RendezVous from "../models/RendezVous.js";
import Patient from "../models/Patient.js";
import Dentiste from "../models/Dentiste.js";
import { Op } from "sequelize";

// 📋 Liste tous les rendez-vous du dentiste connecté
export const getRendezVous = async (req, res) => {
  try {
    const dentiste = await Dentiste.findOne({ where: { userId: req.user.id } });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    const rendezVous = await RendezVous.findAll({
      where: { dentisteId: dentiste.id },
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
    const rdv = await RendezVous.findByPk(req.params.id, { include: [Patient, Dentiste] });
    if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    const dentiste = await Dentiste.findOne({ where: { userId: req.user.id } });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    if (rdv.dentisteId !== dentiste.id) return res.status(403).json({ message: "Non autorisé" });
    res.json(rdv);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ➕ Créer un rendez-vous
export const createRendezVous = async (req, res) => {
  try {
    const { patientId, dateDebut, dateFin, note } = req.body;
    if (!patientId || !dateDebut) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const dentiste = await Dentiste.findOne({ where: { userId: req.user.id } });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    const newRdv = await RendezVous.create({
      patientId,
      dentisteId: dentiste.id,
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

    const dentiste = await Dentiste.findOne({ where: { userId: req.user.id } });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    if (rdv.dentisteId !== dentiste.id) return res.status(403).json({ message: "Non autorisé" });

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

    const dentiste = await Dentiste.findOne({ where: { userId: req.user.id } });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    if (rdv.dentisteId !== dentiste.id) return res.status(403).json({ message: "Non autorisé" });

    await rdv.destroy();
    res.json({ message: "Rendez-vous supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔎 Récupérer tous les rendez-vous d’un dentiste par ID
export const getRendezVousByDentiste = async (req, res) => {
  try {
    const dentisteId = req.params.dentisteId;
    const rendezVous = await RendezVous.findAll({
      where: { dentisteId },
      include: [Patient, Dentiste],
    });

    if (rendezVous.length === 0) {
      return res.status(404).json({ message: "Aucun rendez-vous trouvé pour ce dentiste" });
    }

    res.json(rendezVous);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📊 Histogramme : nombre de RDV par jour/semaine
export const getRendezVousHistogramme = async (req, res) => {
  try {
    const { mode } = req.query; // "jour" ou "semaine"

    let groupByFormat;
    if (mode === "semaine") {
      groupByFormat = "%Y-%u"; // année + semaine
    } else {
      groupByFormat = "%Y-%m-%d"; // par défaut : jour
    }

    const data = await RendezVous.findAll({
      attributes: [
        [RendezVous.sequelize.fn("DATE_FORMAT", RendezVous.sequelize.col("dateDebut"), groupByFormat), "periode"],
        [RendezVous.sequelize.fn("COUNT", RendezVous.sequelize.col("id")), "total"],
      ],
      group: ["periode"],
      order: [["periode", "ASC"]],
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📈 Courbe : évolution mensuelle des RDV
export const getRendezVousCourbe = async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();

    const startOfYear = new Date(currentYear, 0, 1); // 1er janvier
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59); // 31 décembre

    const data = await RendezVous.findAll({
      attributes: [
        [RendezVous.sequelize.fn("DATE_FORMAT", RendezVous.sequelize.col("dateDebut"), "%Y-%m"), "mois"],
        [RendezVous.sequelize.fn("COUNT", RendezVous.sequelize.col("id")), "total"],
      ],
      where: {
        dateDebut: {
          [Op.gte]: startOfYear,
          [Op.lte]: endOfYear
        }
      },
      group: ["mois"],
      order: [["mois", "ASC"]],
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

  export const getQuickStats = async (req, res) => {
  try {
    const dentiste = await Dentiste.findOne({ where: { userId: req.user.id } });
    if (!dentiste) return res.status(404).json({ message: "Dentiste non trouvé" });

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const rdvToday = await RendezVous.count({
      where: { 
        dentisteId: dentiste.id, 
        dateDebut: { [Op.gte]: startOfToday } 
      }
    });

    const rdvThisMonth = await RendezVous.count({
      where: { 
        dentisteId: dentiste.id, 
        dateDebut: { [Op.gte]: startOfMonth } 
      }
    });

    res.json({ today: rdvToday, thisMonth: rdvThisMonth });
  } catch (error) {
    console.error(error); // <-- Ajoute ça pour voir l'erreur exacte dans la console
    res.status(500).json({ message: "Erreur serveur", error });
  }};
  // 📈 Courbe : évolution annuelle des RDV
export const getRendezVousAnnual = async (req, res) => {
  try {
    const data = await RendezVous.findAll({
      attributes: [
        [RendezVous.sequelize.fn("DATE_FORMAT", RendezVous.sequelize.col("dateDebut"), "%Y"), "annee"],
        [RendezVous.sequelize.fn("COUNT", RendezVous.sequelize.col("id")), "total"],
      ],
      group: ["annee"],
      order: [["annee", "ASC"]],
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};



