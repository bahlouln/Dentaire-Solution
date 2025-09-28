import RendezVous from "../models/RendezVous.js";
import Patient from "../models/Patient.js";
import Dentiste from "../models/Dentiste.js";
import { Op } from "sequelize";

export const getRendezVous = async (req, res) => {
    try {
        const dentisteId = req.dentiste.id;
        const rendezVous = await RendezVous.findAll({
            where: { dentisteId },
            include: [Patient, Dentiste],
            order: [['dateDebut','ASC']]
        });
        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};

export const getRendezVousById = async (req, res) => {
    try {
        const rdv = await RendezVous.findByPk(req.params.id, { include: [Patient, Dentiste] });
        if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });
        if (rdv.dentisteId !== req.dentiste.id) return res.status(403).json({ message: "Non autorisé" });
        res.json(rdv);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};

export const createRendezVous = async (req, res) => {
    try {
        const { patientId, dateDebut, dateFin, note } = req.body;
        if (!patientId || !dateDebut) {
            return res.status(400).json({ message: "Champs requis manquants" });
        }

        const dentisteId = req.dentiste.id;

        // (Facultatif mais recommandé) s’assurer que le patient appartient au dentiste
        const patient = await Patient.findByPk(patientId);
        if (!patient) return res.status(404).json({ message: "Patient introuvable" });
        if ((patient.dentisteId ?? patient.DentisteId) !== dentisteId) {
            return res.status(403).json({ message: "Patient non autorisé pour ce dentiste" });
        }

        const newRdv = await RendezVous.create({
            patientId,
            dentisteId,
            dateDebut,
            dateFin: dateFin || null,
            note: note || null,
        });

        res.status(201).json(newRdv);
    } catch (error) {
        console.error("Erreur création RDV:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};

export const updateRendezVous = async (req, res) => {
    try {
        const rdv = await RendezVous.findByPk(req.params.id);
        if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });
        if (rdv.dentisteId !== req.dentiste.id) return res.status(403).json({ message: "Non autorisé" });

        // on ne permet pas de changer dentisteId par sécurité
        const { dentisteId, ...allowed } = req.body || {};
        await rdv.update(allowed);
        res.json(rdv);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};

export const deleteRendezVous = async (req, res) => {
    try {
        const rdv = await RendezVous.findByPk(req.params.id);
        if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });
        if (rdv.dentisteId !== req.dentiste.id) return res.status(403).json({ message: "Non autorisé" });

        await rdv.destroy();
        res.json({ message: "Rendez-vous supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};

// 📊 Histogramme (filtré par dentiste)
export const getRendezVousHistogramme = async (req, res) => {
    try {
        const { mode } = req.query; // "jour" | "semaine"
        const groupByFormat = mode === "semaine" ? "%Y-%u" : "%Y-%m-%d";

        const data = await RendezVous.findAll({
            attributes: [
                [RendezVous.sequelize.fn("DATE_FORMAT", RendezVous.sequelize.col("dateDebut"), groupByFormat), "periode"],
                [RendezVous.sequelize.fn("COUNT", RendezVous.sequelize.col("id")), "total"],
            ],
            where: { dentisteId: req.dentiste.id },                   // ✅ filtre multi-tenant
            group: ["periode"],
            order: [["periode", "ASC"]],
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};

// 📈 Courbe mensuelle (filtrée)
export const getRendezVousCourbe = async (req, res) => {
    try {
        const today = new Date();
        const currentYear = today.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear   = new Date(currentYear, 11, 31, 23, 59, 59);

        const data = await RendezVous.findAll({
            attributes: [
                [RendezVous.sequelize.fn("DATE_FORMAT", RendezVous.sequelize.col("dateDebut"), "%Y-%m"), "mois"],
                [RendezVous.sequelize.fn("COUNT", RendezVous.sequelize.col("id")), "total"],
            ],
            where: {
                dentisteId: req.dentiste.id,                            // ✅
                dateDebut: { [Op.gte]: startOfYear, [Op.lte]: endOfYear }
            },
            group: ["mois"],
            order: [["mois", "ASC"]],
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};

export const getQuickStats = async (req, res) => {
    try {
        const dentisteId = req.dentiste.id;
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        const rdvToday = await RendezVous.count({
            where: { dentisteId, dateDebut: { [Op.gte]: startOfToday, [Op.lte]: endOfToday } }
        });

        const rdvThisMonth = await RendezVous.count({
            where: { dentisteId, dateDebut: { [Op.gte]: startOfMonth, [Op.lte]: endOfMonth } }
        });

        res.json({ today: rdvToday, thisMonth: rdvThisMonth });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};

export const getRendezVousAnnual = async (req, res) => {
    try {
        const data = await RendezVous.findAll({
            attributes: [
                [RendezVous.sequelize.fn("DATE_FORMAT", RendezVous.sequelize.col("dateDebut"), "%Y"), "annee"],
                [RendezVous.sequelize.fn("COUNT", RendezVous.sequelize.col("id")), "total"],
            ],
            where: { dentisteId: req.dentiste.id },                   // ✅
            group: ["annee"],
            order: [["annee", "ASC"]],
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};
