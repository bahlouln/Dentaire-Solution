import express from 'express';
import { authenticateToken } from './AuthRoutes.js';
import { requireDentisteOrSecretaire, attachDentisteForAny } from '../middlewares/rdvauth.js';
import {
    getRendezVous, getRendezVousById, createRendezVous,
    updateRendezVous, deleteRendezVous,
    getRendezVousHistogramme, getRendezVousCourbe,
    getQuickStats, getRendezVousAnnual
} from '../controllers/RendezVousController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireDentisteOrSecretaire);
router.use(attachDentisteForAny);

// RDV
router.get('/rendezvous', getRendezVous);
router.get('/rendezvous/:id', getRendezVousById);
router.post('/rendezvous', createRendezVous);
router.put('/rendezvous/:id', updateRendezVous);
router.delete('/rendezvous/:id', deleteRendezVous);

// Stats
router.get('/stats/histogramme', getRendezVousHistogramme);
router.get('/stats/courbe', getRendezVousCourbe);
router.get('/stats/quick', getQuickStats);
router.get('/stats/annual', getRendezVousAnnual);

export default router;
