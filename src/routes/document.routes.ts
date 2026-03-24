import { Router } from 'express';
import {
  createBatch,
  getBatch,
  getDocument
} from '../controllers/document.controller';

const router = Router();

router.post('/batch', createBatch);
router.get('/batch/:batchId', getBatch);
router.get('/:documentId', getDocument);

export default router;