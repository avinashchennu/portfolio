// Backend entry: wires the modules together and starts the API
import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { seed } from './seed.js';
import { notFound, errorHandler } from './middleware.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';

seed();

const app = express();
app.use(cors());
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);   // login module
app.use('/api', userRoutes);        // user module
app.use('/api/admin', adminRoutes); // admin module

app.use('/api', notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log('Demo user:  demo@example.com / demo1234');
  console.log('Admin user: admin@example.com / admin1234');
});
