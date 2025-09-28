import Dentiste from '../models/Dentiste.js';
import Secretaire from '../models/Secretaire.js';

export const requireDentisteOrSecretaire = (req, res, next) => {
    if (!req.user || !['dentiste','secretaire'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Accès dentiste/secrétaire requis' });
    }
    next();
};

export const attachDentisteForAny = async (req, res, next) => {
    try {
        let dentisteId = null;

        if (req.user.role === 'dentiste') {
            const dentiste = await Dentiste.findOne({ where: { userId: req.user.userId } });
            if (!dentiste) return res.status(404).json({ error: 'Profil dentiste introuvable' });
            req.dentiste = dentiste;               // ✅ source de vérité
            req.actor = { role: 'dentiste', id: dentiste.id, userId: req.user.userId };
            return next();
        }

        if (req.user.role === 'secretaire') {
            const secretaire = await Secretaire.findOne({ where: { userId: req.user.userId } });
            if (!secretaire) return res.status(404).json({ error: 'Profil secrétaire introuvable' });

            dentisteId = secretaire.dentisteId ?? secretaire.DentisteId; // selon ta FK
            if (!dentisteId) return res.status(400).json({ error: 'Secrétaire sans dentiste lié' });

            const dentiste = await Dentiste.findByPk(dentisteId);
            if (!dentiste) return res.status(404).json({ error: 'Profil dentiste introuvable' });

            req.secretaire = secretaire;
            req.dentiste = dentiste;               // ✅ même interface que pour dentiste
            req.actor = { role: 'secretaire', id: secretaire.id, userId: req.user.userId };
            return next();
        }

        return res.status(403).json({ error: 'Rôle non autorisé' });
    } catch (e) {
        next(e);
    }
};
