import express from 'express';
import documentRoutes from './routes/document.routes';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/documents', documentRoutes);

export default app;