import multer from 'multer';
import { Image, Product } from '../models/productModel.js';
import { Users } from '../models/userModels.js';
import path from 'path';

// mengambil semua data product
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Image, attributes: ['filename', 'url'] },
        { model: Users, as: 'user', attributes: ['name', 'email'] }
      ]
    });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

// Konfigurasi multer
export const upload = multer({ storage: storage });

// menambahkan data
export const addProduct = async (req, res) => {
  try {
    const { name, harga, stock, deskripsi, pelapakId, status } = req.body;

    // Mencari pengguna berdasarkan pelapakId
    const user = await Users.findOne({
      where: { id: pelapakId },
      attributes: ['name', 'email']
    });

    if (!user) {
      return res.status(404).json({ errorMessage: 'Data pengguna tidak ditemukan' });
    }

    // Membuat produk baru dengan userId dari pelapak yang ditemukan
    const product = await Product.create({
      name,
      harga,
      stock,
      deskripsi,
      pelapakId,
      status
    });

    const { files } = req;

    if (files && files.length > 0) {
      const imageUrls = [];
      for (const file of files) {
        const ext = path.extname(file.originalname);
        const fileName = file.filename;
        const url = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
        const allowedTypes = ['.png', '.jpg', '.jpeg'];

        if (!allowedTypes.includes(ext.toLowerCase())) {
          return res.status(422).json({ errorMessage: 'Jenis file gambar tidak valid' });
        }

        if (file.size > 5000000) {
          return res.status(422).json({ errorMessage: 'Ukuran gambar harus kurang dari 5 MB' });
        }

        imageUrls.push(url);

        await Image.create({
          filename: fileName,
          data: file.buffer,
          productId: product.id,
          url: url
        });
      }

      res.json({
        message: 'Produk berhasil ditambahkan'
        // imageUrls: imageUrls
      });
    } else {
      res.json({
        message: 'Produk berhasil ditambahkan'
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// mengambil data sesuai dengan id user
export const getProductByIdUser = async (req, res) => {
  try {
    const { pelapakId } = req.params;

    // Mencari pelapak berdasarkan ID pengguna
    const pelapak = await Users.findOne({
      where: { id: pelapakId }
    });

    if (!pelapak) {
      return res.status(404).json({ errorMessage: 'Pelapak tidak ditemukan' });
    }

    // Mencari produk yang dimiliki oleh pelapak
    const products = await Product.findAll({
      where: { pelapakId },
      include: [{ model: Image, attributes: ['filename', 'url'] }]
    });

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};
