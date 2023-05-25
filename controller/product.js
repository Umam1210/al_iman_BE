import Product from "../models/productModel.js";
import Users from "../models/userModels.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: {
        model: Users,
        attributes: ["name", "email"]
      }
    });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};
