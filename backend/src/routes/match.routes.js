import { Router } from 'express';
import { getMatches, getBlindMatches, createMatch, createBlindMatch, revealMatch, unmatch, getMatchById } from '../controllers/match.controller.js';
import { auth } from '../middlewares/index.js';

const router = Router();
router.use(auth);

router.get('/', getMatches);
router.get('/blind', getBlindMatches);
router.post('/', createMatch);
router.post('/blind', createBlindMatch);
router.get('/:matchId', getMatchById);
router.put('/:matchId/reveal', revealMatch);
router.delete('/:matchId', unmatch);

export default router;
