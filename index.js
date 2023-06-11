import express from 'express';
import db from './config/database.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

import router from './routes/index.js';

const app = express();
const { PORT } = process.env;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Atur header lain yang diperlukan sesuai kebutuhan aplikasi Anda
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(router);

const startServer = async () => {
  try {
    await db.authenticate();
    (async () => {
      await db.sync();
    })();
    console.log('Connected to the database');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
