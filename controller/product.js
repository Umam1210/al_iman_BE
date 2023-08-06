import multer from 'multer';
import { Image, Product } from '../models/productModel.js';
import { User } from '../models/userModels.js';
import path from 'path';
import { Op } from 'sequelize';
import { v2 as cloudinary } from 'cloudinary';

// mengambil semua data product
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Image, attributes: ['filename', 'url'] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ]
    });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// mengambil data sesuai dengan id
export const getProductByid = async (req, res) => {
  try {
    const { productId } = req.params;
    // mencari data berdasarka id
    const product = await Product.findByPk(productId, {
      include: [
        { model: Image, attributes: ['filename', 'url'] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ]
    });
    if (!product) {
      return res.status(404).json({ error: 'product tidak ditemukan' });
    }
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// Konfigurasi multer
const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, 'uploads/');
  // },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

export const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: 'dm5jqoxvb',
  api_key: '693821471851547',
  api_secret: 'YgoClzr-fCC6rSpSG0u-L87cHgM'
});

async function uploadImageToCloudinary(file) {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'al-iman-boga', // Nama folder di Cloudinary untuk menyimpan gambar (opsional)
      tags: 'al-iman-boga' // Tags yang akan ditambahkan pada gambar di Cloudinary (opsional)
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Gagal mengunggah gambar ke Cloudinary: ${error.message}`);
  }
}

// menambahkan data
// export const addProduct = async (req, res) => {
//   try {
//     const { name, harga, stock, deskripsi, pelapakId, status } = req.body;

//     // Mencari pengguna berdasarkan pelapakId
//     const user = await User.findOne({
//       where: { id: pelapakId },
//       attributes: ['name', 'email']
//     });

//     if (!user) {
//       return res.status(404).json({ errorMessage: 'Data pengguna tidak ditemukan' });
//     }

//     // Membuat produk baru dengan userId dari pelapak yang ditemukan
//     const product = await Product.create({
//       name,
//       harga,
//       stock,
//       deskripsi,
//       pelapakId,
//       status
//     });

//     const { files } = req;

//     if (files && files.length > 0) {
//       const imageUrls = [];
//       for (const file of files) {
//         const ext = path.extname(file.originalname);
//         const fileName = file.filename;
//         const url = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
//         const allowedTypes = ['.png', '.jpg', '.jpeg'];

//         if (!allowedTypes.includes(ext.toLowerCase())) {
//           return res.status(422).json({ errorMessage: 'Jenis file gambar tidak valid' });
//         }

//         if (file.size > 5000000) {
//           return res.status(422).json({ errorMessage: 'Ukuran gambar harus kurang dari 5 MB' });
//         }

//         imageUrls.push(url);

//         await Image.create({
//           filename: fileName,
//           data: file.buffer,
//           productId: product.id,
//           url: url
//         });
//       }

//       res.json({
//         message: 'Produk berhasil ditambahkan'
//         // imageUrls: imageUrls
//       });
//     } else {
//       res.json({
//         message: 'Produk berhasil ditambahkan'
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ errorMessage: error.message });
//   }
// };

export const addProduct = async (req, res) => {
  try {
    // Mendapatkan data dari request body
    const { name, harga, stock, deskripsi, pelapakId, status } = req.body;

    // Mencari pengguna berdasarkan pelapakId
    const user = await User.findOne({
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
        // Mengunggah gambar ke Cloudinary dan menyimpan informasi gambar ke database
        const imageUrl = await uploadImageToCloudinary(file);
        imageUrls.push(imageUrl);

        await Image.create({
          filename: file.originalname,
          data: file.buffer,
          productId: product.id,
          url: imageUrl
        });
      }

      res.json({
        message: 'Produk berhasil ditambahkan',
        imageUrls: imageUrls // Array berisi URL gambar yang diunggah ke Cloudinary
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
    const pelapak = await User.findOne({
      where: { id: pelapakId }
    });

    if (!pelapak) {
      return res.status(404).json({ errorMessage: 'Pelapak tidak ditemukan' });
    }

    // Mencari produk yang dimiliki oleh pelapak
    const products = await Product.findAll({
      where: { pelapakId },
      include: [
        { model: Image, attributes: ['filename', 'url'] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ]
    });

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// hapus data sesuai dengan id
export const deleteProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    // Mencari produk berdasarkan ID
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ errorMessage: 'Produk tidak ditemukan' });
    }

    // Menghapus produk
    await product.destroy();

    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// Edit Product by Id
// export const editProductById = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { name, harga, stock, deskripsi, pelapakId, status } = req.body;

//     console.log('Request Body:', req.body); // Menampilkan nilai req.body
//     console.log('Request params:', req.params); // Menampilkan nilai req.body

//     // Mencari produk berdasarkan ID
//     const product = await Product.findByPk(productId);

//     if (!product) {
//       return res.status(404).json({ errorMessage: 'Produk tidak ditemukan' });
//     }
//     // Mengedit atribut-atribut produk
//     product.name = name;
//     product.harga = harga;
//     product.stock = stock;
//     product.status = status;
//     product.deskripsi = deskripsi;
//     product.pelapakId = pelapakId;

//     // Menyimpan perubahan ke database
//     await product.save();

//     // Mengupdate gambar produk jika ada perubahan
//     const { files } = req;
//     if (files && files.length > 0) {
//       // Menghapus gambar-gambar produk yang ada sebelumnya
//       await Image.destroy({ where: { productId } });

//       const imageUrls = [];
//       for (const file of files) {
//         const ext = path.extname(file.originalname);
//         const fileName = file.filename;
//         const url = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
//         const allowedTypes = ['.png', '.jpg', '.jpeg'];

//         if (!allowedTypes.includes(ext.toLowerCase())) {
//           return res.status(422).json({ errorMessage: 'Jenis file gambar tidak valid' });
//         }

//         if (file.size > 5000000) {
//           return res.status(422).json({ errorMessage: 'Ukuran gambar harus kurang dari 5 MB' });
//         }

//         imageUrls.push(url);

//         await Image.create({
//           filename: fileName,
//           data: file.buffer,
//           productId: product.id,
//           url: url
//         });
//       }

//       res.json({
//         message: 'Produk berhasil diubah',
//         product: product.toJSON(),
//         imageUrls
//       });
//     } else {
//       res.json({
//         message: 'Produk berhasil diubah',
//         product: product.toJSON()
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ errorMessage: error.message });
//   }
// };
// export const editProductById = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { name, harga, stock, deskripsi, pelapakId, visibility } = req.body;

//     console.log('Request Body:', req.body);
//     console.log('Request params:', req.params);

//     const product = await Product.findByPk(productId);

//     if (!product) {
//       return res.status(404).json({ errorMessage: 'Produk tidak ditemukan' });
//     }

//     const existingImages = await product.getImages(); // Mengambil gambar-gambar terkait produk
//     const existingImageUrls = existingImages.map((image) => image.url); // Menyimpan URL gambar yang ada saat ini

//     product.name = name;
//     product.harga = harga;
//     product.stock = stock;
//     product.visibility = visibility;
//     product.deskripsi = deskripsi;
//     product.pelapakId = pelapakId;

//     await product.save();

//     const { files } = req;
//     if (files && files.length > 0) {
//       await Image.destroy({ where: { productId } });

//       const imageUrls = [];
//       for (const file of files) {
//         const ext = path.extname(file.originalname);
//         const fileName = file.filename;
//         const url = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
//         const allowedTypes = ['.png', '.jpg', '.jpeg'];

//         if (!allowedTypes.includes(ext.toLowerCase())) {
//           return res.status(422).json({ errorMessage: 'Jenis file gambar tidak valid' });
//         }

//         if (file.size > 5000000) {
//           return res.status(422).json({ errorMessage: 'Ukuran gambar harus kurang dari 5 MB' });
//         }

//         imageUrls.push(url);

//         await Image.create({
//           filename: fileName,
//           data: file.buffer,
//           productId: product.id,
//           url: url
//         });
//       }

//       res.json({
//         message: 'Produk berhasil diubah',
//         product: product.toJSON(),
//         imageUrls
//       });
//     } else {
//       res.json({
//         message: 'Produk berhasil diubah',
//         product: product.toJSON(),
//         imageUrls: existingImageUrls // Menggunakan URL gambar yang ada saat ini
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ errorMessage: error.message });
//   }
// };

export const editProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, harga, stock, deskripsi, pelapakId, visibility } = req.body;

    console.log('Request Body:', req.body);
    console.log('Request params:', req.params);

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ errorMessage: 'Produk tidak ditemukan' });
    }

    const existingImages = await product.getImages(); // Mengambil gambar-gambar terkait produk
    const existingImageUrls = existingImages.map((image) => image.url); // Menyimpan URL gambar yang ada saat ini

    product.name = name;
    product.harga = harga;
    product.stock = stock;
    product.visibility = visibility;
    product.deskripsi = deskripsi;
    product.pelapakId = pelapakId;

    await product.save();

    const { files } = req;
    if (files && files.length > 0) {
      await Image.destroy({ where: { productId } });

      const imageUrls = [];
      for (const file of files) {
        const ext = path.extname(file.originalname);
        const fileName = file.filename;
        const allowedTypes = ['.png', '.jpg', '.jpeg'];

        if (!allowedTypes.includes(ext.toLowerCase())) {
          return res.status(422).json({ errorMessage: 'Jenis file gambar tidak valid' });
        }

        if (file.size > 5000000) {
          return res.status(422).json({ errorMessage: 'Ukuran gambar harus kurang dari 5 MB' });
        }

        // Mengunggah gambar ke Cloudinary dan menyimpan informasi gambar ke database
        const imageUrl = await uploadImageToCloudinary(file);
        imageUrls.push(imageUrl);

        await Image.create({
          filename: fileName,
          productId: product.id,
          url: imageUrl
        });
      }

      res.json({
        message: 'Produk berhasil diubah',
        product: product.toJSON(),
        imageUrls
      });
    } else {
      res.json({
        message: 'Produk berhasil diubah',
        product: product.toJSON(),
        imageUrls: existingImageUrls // Menggunakan URL gambar yang ada saat ini
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// export const editProductById = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { name, harga, stock, deskripsi, pelapakId, visibility } = req.body;

//     console.log('Request Body:', req.body);
//     console.log('Request params:', req.params);

//     const product = await Product.findByPk(productId, { include: Image });

//     if (!product) {
//       return res.status(404).json({ errorMessage: 'Produk tidak ditemukan' });
//     }

//     product.name = name;
//     product.harga = harga;
//     product.stock = stock;
//     product.visibility = visibility;
//     product.deskripsi = deskripsi;
//     product.pelapakId = pelapakId;

//     await product.save();

//     const { files } = req;

//     if (files && files.length > 0) {
//       const existingImages = product.images; // Mengambil gambar-gambar terkait produk
//       const existingImageUrls = existingImages.map((image) => image.url); // Menyimpan URL gambar yang ada saat ini

//       // Menghapus gambar-gambar yang sudah ada yang ingin diubah atau dihapus
//       const deletedImageIds = req.body.deletedImageIds || [];
//       for (const deletedImageId of deletedImageIds) {
//         await Image.destroy({ where: { id: deletedImageId, productId } });
//       }

//       const imageUrls = [];

//       // Mengolah gambar-gambar baru
//       for (const file of files) {
//         const ext = path.extname(file.originalname);
//         const fileName = file.filename;
//         const url = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
//         const allowedTypes = ['.png', '.jpg', '.jpeg'];

//         if (!allowedTypes.includes(ext.toLowerCase())) {
//           return res.status(422).json({ errorMessage: 'Jenis file gambar tidak valid' });
//         }

//         if (file.size > 5000000) {
//           return res.status(422).json({ errorMessage: 'Ukuran gambar harus kurang dari 5 MB' });
//         }

//         imageUrls.push(url);

//         await Image.create({
//           filename: fileName,
//           data: file.buffer,
//           productId: product.id,
//           url: url
//         });
//       }

//       res.json({
//         message: 'Produk berhasil diubah',
//         product: product.toJSON(),
//         imageUrls,
//         existingImageUrls
//       });
//     } else {
//       res.json({
//         message: 'Produk berhasil diubah',
//         product: product.toJSON()
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ errorMessage: error.message });
//   }
// };

export const searchProductByName = async (req, res) => {
  try {
    const { productName } = req.query;

    // Mencari produk berdasarkan nama produk
    const products = await Product.findAll({
      where: { name: { [Op.like]: `%${productName}%` } },
      include: [{ model: Image, attributes: ['filename', 'url'] }]
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Terjadi kesalahan pada server' });
  }
};

export const searchProductByPelapak = async (req, res) => {
  try {
    const { productName } = req.query;
    const { pelapakId } = req.params;
    // Ambil ID pelapak dari parameter permintaan
    console.log('ID Pelapak:', pelapakId);
    // Mencari produk berdasarkan nama produk dan ID pelapak
    const products = await Product.findAll({
      where: {
        name: { [Op.like]: `%${productName}%` },
        pelapakId // Hanya produk dengan ID pelapak yang sesuai
      },
      include: [{ model: Image, attributes: ['filename', 'url'] }]
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Terjadi kesalahan pada server' });
  }
};
