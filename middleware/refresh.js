import jwt from 'jsonwebtoken';
import { Users } from '../models/userModels.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token tidak valid' });
      }

      // Menyimpan ID pengguna yang terautentikasi di dalam req object
      req.userId = decoded.userId;

      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Token refresh tidak ditemukan' });
    }

    const user = await Users.findOne({
      where: {
        refresh_token: refreshToken
      }
    });

    if (!user) {
      return res.status(403).json({ error: 'Token refresh tidak valid' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token refresh tidak valid' });
      }

      const { id, name, email } = decoded;
      const accessToken = jwt.sign({ id, name, email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15s'
      });

      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};
