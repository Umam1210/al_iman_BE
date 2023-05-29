import { Image, Product } from '../models/productModel.js';
import { Users } from '../models/userModels.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Image, attributes: ['filename'] },
        { model: Users, attributes: ['name', 'email'] }
      ]
    });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, harga, stock, deskripsi, pelapakId, status } = req.body;

    // Membuat produk baru
    const product = await Product.create({
      name,
      harga,
      stock,
      deskripsi,
      pelapakId,
      status
    });

    // Mengunggah gambar-gambar
    const { files } = req;

    if (files && files.length > 0) {
      for (const file of files) {
        await Image.create({
          filename: file.originalname,
          data: file.buffer,
          productId: product.id
        });
      }
    }

    res.json({ message: 'Produk berhasil ditambahkan' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// export const addProduct = async (req, res) => {
//   try {
//     const { name, harga, stock, deskripsi, status } = req.body;
//     const { userId } = req.params;

//     // Mencari pelapak berdasarkan ID pengguna
//     const pelapak = await Users.findOne({
//       where: { id: userId }
//     });

//     if (!pelapak) {
//       return res.status(404).json({ errorMessage: 'Pelapak tidak ditemukan' });
//     }

//     // Membuat produk baru dengan pelapakId yang didapatkan
//     const product = await Product.create({
//       name,
//       harga,
//       stock,
//       deskripsi,
//       pelapakId: pelapak.id,
//       status
//     });

//     // Mengunggah gambar-gambar
//     const { files } = req;

//     if (files && files.length > 0) {
//       for (const file of files) {
//         await Image.create({
//           filename: file.originalname,
//           data: file.buffer,
//           productId: product.id
//         });
//       }
//     }

//     res.json({ message: 'Produk berhasil ditambahkan' });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ errorMessage: error.message });
//   }
// };

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
      where: { pelapakId: pelapakId.name },
      include: [{ model: Image, attributes: ['filename'] }]
    });

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};
