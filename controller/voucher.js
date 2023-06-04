import { User } from '../models/userModels.js';
import { Voucher } from '../models/voucherModel.js';

export const getVouchers = async (req, res) => {
  try {
    const voucers = await Voucher.findAll();
    res.json(voucers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getVoucherById = async (req, res) => {
  try {
    const { voucherId } = req.params;
    const voucher = await Voucher.findByPk(voucherId);
    if (!voucher) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json(voucher);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const createVoucher = async (req, res) => {
  try {
    const { jumlah, name, userId } = req.body;

    let user = null;
    if (userId) {
      user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ errorMessage: 'User tidak ditemukan' });
      }
    }

    const voucher = await Voucher.create({
      jumlah,
      name,
      userId: user ? user.id : null
    });

    res.status(201).json({ message: 'Voucher berhasil dibuat', voucher });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const editVoucherById = async (req, res) => {
  try {
    const { voucherId } = req.params;
    const { jumlah, name, userId } = req.body;

    // Mencari voucher berdasarkan ID
    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      return res.status(404).json({ errorMessage: 'Voucher tidak ditemukan' });
    }

    // Mengedit atribut-atribut voucher
    voucher.jumlah = jumlah;
    voucher.name = name;

    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ errorMessage: 'User tidak ditemukan' });
      }
      voucher.userId = user.id;
    } else {
      voucher.userId = null;
    }

    // Menyimpan perubahan ke database
    await voucher.save();

    res.json({ message: 'Voucher berhasil diubah', voucher });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteVoucherById = async (req, res) => {
  try {
    const { voucherId } = req.params;

    // Mencari voucher berdasarkan ID
    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      return res.status(404).json({ errorMessage: 'Voucher tidak ditemukan' });
    }

    // Menghapus voucher dari database
    await voucher.destroy();

    res.json({ message: 'Voucher berhasil dihapus' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getVoucherByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Mencari pengguna berdasarkan ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ errorMessage: 'Pengguna tidak ditemukan' });
    }

    // Mengambil voucher yang dimiliki oleh pengguna
    const vouchers = await Voucher.findAll({ where: { userId } });

    if (vouchers.length === 0) {
      return res.status(200).json({ message: 'Pengguna tidak memiliki voucher' });
    }

    res.json(vouchers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};
