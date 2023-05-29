import { DataTypes, Sequelize } from 'sequelize';
import db from '../config/database.js';

export const Product = db.define(
  'products',
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
    pelapakId: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING
    }
  },
  {
    freezeTableName: true
  }
);

export const Image = db.define(
  'images',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    filename: {
      type: DataTypes.STRING
    },

    productId: {
      type: DataTypes.UUID,
      references: {
        model: Product,
        key: 'id'
      }
    }
  },
  {
    freezeTableName: true
  }
);

Product.hasMany(Image, { foreignKey: 'productId' });
