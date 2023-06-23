import { Op } from 'sequelize';
import { User } from '../models/userModels.js';
import { Voucher, VoucherUsage } from '../models/voucherModel.js';

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
      name
    });

    // Jika terdapat user yang terkait, buat juga entitas VoucherUsage
    if (user) {
      await VoucherUsage.create({
        voucherId: voucher.id,
        userId: user.id,
        isUsed: false,
        usedAt: null
      });
    }

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
    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      return res.status(404).json({ errorMessage: 'Voucher tidak ditemukan' });
    }
    voucher.jumlah = jumlah;
    voucher.name = name;
    let user = null;
    let voucherUsage = null;

    if (userId) {
      user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ errorMessage: 'User tidak ditemukan' });
      }
      voucherUsage = await VoucherUsage.findOne({
        where: {
          voucherId,
          userId: user.id
        }
      });

      if (voucherUsage) {
        voucherUsage.isUsed = false;
        voucherUsage.usedAt = null;
        await voucherUsage.save();
      } else {
        voucherUsage = await VoucherUsage.create({
          voucherId,
          userId: user.id,
          isUsed: false,
          usedAt: null
        });
      }
    } else {
      // Jika userId tidak ada, periksa apakah terdapat entitas VoucherUsage yang terkait dan hapus jika ada
      voucherUsage = await VoucherUsage.findOne({
        where: {
          voucherId,
          userId: null
        }
      });

      if (voucherUsage) {
        await voucherUsage.destroy();
      }
    }

    // Menyimpan perubahan pada voucher ke database
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
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ errorMessage: 'Pengguna tidak ditemukan' });
    }

    const voucherUsages = await VoucherUsage.findAll({ where: { userId } });

    if (voucherUsages.length === 0) {
      return res.status(200).json({ message: 'Pengguna tidak memiliki voucher' });
    }

    const voucherIds = voucherUsages.map((voucherUsage) => voucherUsage.voucherId);
    const vouchers = await Voucher.findAll({ where: { id: voucherIds } });

    res.json(vouchers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const searchVoucher = async (req, res) => {
  try {
    const { voucherName } = req.query;
    const vouchers = await Voucher.findAll({
      where: {
        name: {
          [Op.like]: `%${voucherName}%`
        }
      }
    });
    res.json(vouchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Terjadi kesalahan pada server' });
  }
};
