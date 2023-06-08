import { Order } from '../models/orderModel.js';
import { Product } from '../models/productModel.js';
import { User } from '../models/userModels.js';
import { Voucher } from '../models/voucherModel.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Product, as: 'product', attributes: ['name', 'harga'] },
        { model: Voucher, as: 'voucher', attributes: ['jumlah', 'name'] }
      ]
    });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Product, as: 'product', attributes: ['name', 'harga'] },
        { model: Voucher, as: 'voucher', attributes: ['jumlah', 'name'] }
      ]
    });
    if (!order) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { userId, productId, banyak, status, tanggal_ambil, jam_ambil, voucherId, catatan } =
      req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ errorMessage: 'Produk tidak ditemukan' });
    }

    let total_harga = product.harga * banyak;
    let total_bayar = total_harga; // Menggunakan total harga sebagai total bayar awal

    let voucher = null;
    if (voucherId) {
      voucher = await Voucher.findByPk(voucherId);

      if (!voucher) {
        return res.status(404).json({ errorMessage: 'Voucher tidak ditemukan' });
      }

      if (voucher.isUsed) {
        return res.status(400).json({ errorMessage: 'Voucher Sudah Digunakan' });
      }

      // Mengurangi nilai voucher dari total bayar
      total_bayar -= voucher.jumlah;

      // Jika total bayar negatif, maka ubah menjadi 0
      if (total_bayar < 0) {
        total_bayar = 0;
      }
      voucher.isUsed = true;
      await voucher.save();
    }
    const orderCount = await Order.count(); // Menghitung jumlah order yang sudah ada
    const orderId = `ORD${orderCount + 1}`; // Membuat orderId dengan format "ORD" + nomor urut

    const order = await Order.create({
      orderId,
      userId,
      productId,
      banyak,
      total_harga,
      total_bayar,
      status,
      tanggal_pesan: new Date(),
      tanggal_ambil,
      jam_ambil,
      catatan,
      voucherId: voucher ? voucher.id : null,
      usedVoucher: !!voucherId
    });

    res.status(201).json({ message: 'Order berhasil dibuat', order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ errorMessage: 'Order tidak ditemukan' });
    }
    await order.destroy();

    res.json({ message: 'Order berhasil dihapus' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const editOrderById = async (req, res) => {
  try {
    const {
      orderId,
      userId,
      productId,
      banyak,
      status,
      tanggal_ambil,
      jam_ambil,
      voucherId,
      catatan
    } = req.body;
    const { orderId: orderToUpdateId } = req.params;
    const order = await Order.findOne({ where: { orderId: orderToUpdateId } });

    if (!order) {
      return res.status(404).json({ errorMessage: 'Order tidak ditemukan' });
    }
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ errorMessage: 'Produk tidak ditemukan' });
    }
    const total_harga = product.harga * banyak;
    const voucher = await Voucher.findByPk(voucherId);
    let harga_setelah_diskon = total_harga - (voucher ? voucher.jumlah : 0);
    if (harga_setelah_diskon < 0) {
      harga_setelah_diskon = 0;
    }
    await order.update({
      orderId,
      userId,
      productId,
      banyak,
      total_harga: harga_setelah_diskon,
      status,
      tanggal_ambil,
      jam_ambil,
      catatan,
      voucherId: voucher ? voucher.id : null
    });

    res.json({ message: 'Order berhasil diubah', order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getMonthlySales = async (req, res) => {
  try {
    // Mengambil bulan dan tahun saat ini
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Menghitung nilai penjualan per bulan
    const orders = await Order.findAll({
      where: {
        status: 'completed',
        tanggal_ambil: {
          $gte: new Date(currentYear, currentMonth - 1, 1),
          $lt: new Date(currentYear, currentMonth, 1)
        }
      }
    });

    const totalSales = orders.reduce((acc, order) => acc + order.total_harga, 0);

    res.json({ year: currentYear, month: currentMonth, totalSales });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// let voucher = null;
//     if (voucherId) {
//       voucher = await Voucher.findByPk(voucherId);

//       if (!voucher) {
//         return res.status(404).json({ errorMessage: 'Voucher tidak ditemukan' });
//       }

//       // Mengurangi nilai voucher dari total bayar
//       total_bayar -= voucher.jumlah;

//       // Jika total bayar negatif, maka ubah menjadi 0
//       if (total_bayar < 0) {
//         total_bayar = 0;
//       }

//       // Mengubah status voucher menjadi "digunakan" (isUsed: true)
//       voucher.isUsed = true;
//       await voucher.save();
//     }
