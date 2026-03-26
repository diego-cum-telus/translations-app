import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import translateRouter from './routes/translate.js';
import sessionsRouter from './routes/sessions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/translate', translateRouter);
app.use('/api/sessions', sessionsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
