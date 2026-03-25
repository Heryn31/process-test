import { Router } from 'express';
import {
  createBatch,
  getBatch,
  getDocument
} from '../controllers/document.controller';

const router = Router();

/**
 * @swagger
 * /api/documents/batch:
 *   post:
 *     summary: Créer un nouveau batch
 *     tags: [Batches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs utilisateurs
 *                 example: ["u1", "u2", "u3", "u4", "u5"]
 *     responses:
 *       200:
 *         description: Batch créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                batchId:  
 *                  type: string
 *                  format: uuid
 *       400:
 *         description: Requête invalide
 *       500:
 *         description: Erreur serveur
 */

router.post('/batch', createBatch);

/**
 * @swagger
 * /api/documents/batch/{id}:
 *   get:
 *     summary: Récupérer un batch par ID
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du batch
 *     responses:
 *       200:
 *         description: Détails du batch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 batchId:
 *                   type: string
 *                 progress:
 *                   type: number
 *                 status:
 *                   type: string
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Batch non trouvé
 */

router.get('/batch/:batchId', getBatch);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   get:
 *     summary: Récupérer un document par son ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID unique du document à récupérer
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Document PDF trouvé et retourné avec succès
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *             example: "%PDF-1.4\n%âãÏÓ\n1 0 obj\n..."
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: application/pdf
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: inline; filename="document.pdf"
 *       404:
 *         description: Document non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Document introuvable"
 *               message: "Aucun document trouvé avec l'ID spécifié"
 *               statusCode: 404
 *     security:
 *       - bearerAuth: []
 */
router.get('/:documentId', getDocument);

export default router;