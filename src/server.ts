import app from "./app";
import health from "./routes/health.routes";
import metrics from "./routes/metrics.routes";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(health);
app.use(metrics);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
