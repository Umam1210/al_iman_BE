import { DataTypes, Sequelize } from "sequelize";
import db from "../config/database.js";

const Product = db.define(
  "products",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    harga: {
      type: DataTypes.STRING
    },
    stock: {
      type: DataTypes.STRING
    },
    deskripsi: {
      type: DataTypes.STRING
    },
    pelapak: {
      type: DataTypes.STRING
    },
    image: {
      type: DataTypes.BLOB
    }
  },
  {
    freezeTableName: true
  }
);

export default Product;
