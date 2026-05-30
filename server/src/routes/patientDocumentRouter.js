import { Router } from 'express';
import multer from 'multer';
import { getDocuments, createDocument, deleteDocument } from '../controllers/patientDocumentController.js';
import { validateDocument } from '../middlewares/errorHandler.js';
import { requireAuth } from '../middlewares/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.route('/')
  .get(requireAuth, getDocuments)
  .post(requireAuth, upload.single('materials'), createDocument);

router.route('/:id')
  .delete(requireAuth, deleteDocument);

export default router;