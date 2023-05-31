import bcrypt from 'bcrypt';
import { Users } from '../models/userModels.js';
import jwt from 'jsonwebtoken';

// mengambil semua data users
export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ['id', 'name', 'email']
    });
    res.json(users);
  } catch (error) {
    console.log(error);
  }
};

// registrasi
export const register = async (req, res) => {
  const { name, email, password, role, no_kk, kontak, alamat } = req.body;

  try {
    // Periksa apakah pengguna dengan email yang sama sudah terdaftar dalam database
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    const existingNoKK = await Users.findOne({ where: { no_kk } });
    if (existingNoKK) {
      return res.status(400).json({ error: 'Nomor KK sudah terdaftar' });
    }

    // Enkripsi password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat pengguna baru
    const newUser = await Users.create({
      name,
      email,
      password: hashedPassword,
      role,
      no_kk,
      kontak,
      alamat
    });

    res.status(201).json({ message: 'Registrasi berhasil', Users: newUser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Terjadi kesalahan saat melakukan registrasi', errorMessage: error.message });
  }
};

// login
export const Login = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      return res.status(404).json({ msg: 'Email tidak ditemukan' });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(400).json({ msg: 'Password salah' });
    }

    const userId = user.id;
    const name = user.name;
    // const email = user.email;
    const userRole = user.role; // Mengambil nilai userRole dari data pengguna yang masuk
    const accessToken = jwt.sign({ userId, name }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '20s'
    });
    const refreshToken = jwt.sign({ userId, name }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d'
    });
    await Users.update(
      { refreshToken: accessToken },
      {
        where: {
          id: userId
        }
      }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true
    });
    res.cookie('userRole', userRole, {
      // Menambahkan cookie userRole dengan nilai dari data pengguna yang masuk
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ msg: 'Terjadi kesalahan server', error: error.message });
  }
};

// logout
export const logout = async (req, res) => {
  try {
    // Lakukan sesuatu untuk menghapus token refresh dari database atau menyimpan status logout pengguna

    // Menghapus semua cookie pada sisi klien
    res.clearCookie('refreshToken');
    res.clearCookie('userRole');
    // Jika Anda memiliki cookie lain yang ingin dihapus, tambahkan pernyataan res.clearCookie sesuai kebutuhan

    res.status(200).json({ msg: 'Logout berhasil' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Terjadi kesalahan server', errorMessage: error.message });
  }
};

// mengambil data user sesuai dengan id
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Mencari pengguna berdasarkan ID
    const user = await Users.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'kontak', 'alamat']
    });

    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Terjadi kesalahan server', errorMessage: error.message });
  }
};

// edit User
export const editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, kontak, alamat } = req.body;

    // Mencari pengguna berdasarkan ID
    const user = await Users.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // Mengedit atribut-atribut pengguna
    user.name = name;
    user.email = email;
    user.role = role;
    user.kontak = kontak;
    user.alamat = alamat;

    // Menyimpan perubahan ke database
    await user.save();
    console.log(req.headers);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Terjadi kesalahan server', errorMessage: error.message });
  }
};
