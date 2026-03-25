import express from 'express';
import documentRoutes from './routes/document.routes';
import { setupSwagger } from './config/swagger';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/documents', documentRoutes);

setupSwagger(app);

export default app;