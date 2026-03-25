import { Router } from "express";
import { checkHealth } from "../services/health.service";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Vérification de l'état de santé du service
 *     tags: [Health Services]
 *     description: |
 *       Endpoint de health check qui vérifie la disponibilité de tous les services essentiels :
 *       - Base de données MongoDB
 *       - Cache Redis
 *       - Queue (Bull)
 *       - Mémoire disponible
 *       - CPU
 *     operationId: getHealthStatus
 *     responses:
 *       200:
 *         description: Tous les services sont opérationnels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 services:
 *                   type: object
 *                   properties:
 *                     db:
 *                       type: string
 *                       example: ok
 *                     redis:
 *                       type: string
 *                       example: ok
 *                     queue:
 *                       type: string
 *                       example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *       503:
 *         description: Service dégradé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unavailable
 */

router.get("/health", async (req, res) => {
  const health = await checkHealth();

  const status = health.status === "ok" ? 200 : 503;
  res.status(status).json(health);
});

export default router;
