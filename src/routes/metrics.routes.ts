import { Router } from "express";
import { register } from "../services/metrics.service";

const router = Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Exposer les métriques Prometheus
 *     tags: [Monitoring Metrics]
 *     description: |
 *       Endpoint qui expose les métriques au format Prometheus. Ces métriques incluent :
 *       - Nombre de requêtes traitées
 *       - Durée moyenne des requêtes
 *       - Taux d'erreur
 *       - Utilisation de la mémoire et du CPU
 *
 *     operationId: getMetrics
 *     responses:
 *       200:
 *         description: Métriques exposées avec succès
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: |
 *               # HELP http_request_duration_seconds Duration of HTTP requests in seconds
 *               # TYPE http_request_duration_seconds histogram
 *               http_request_duration_seconds_bucket{le="0.1"} 24054
 *               http_request_duration_seconds_bucket{le="0.2"} 33444
 *               http_request_duration_seconds_bucket{le="0.5"} 100392
 *               http_request_duration_seconds_bucket{le="1"} 129389
 *               http_request_duration_seconds_bucket{le="+Inf"} 144320
 *               http_request_duration_seconds_sum 53423
 *               http_request_duration_seconds_count 144320
 *
 */
router.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export default router;