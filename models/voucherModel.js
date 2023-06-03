import { DataTypes, Sequelize } from 'sequelize';
import db from '../config/database.js';
import { Product } from './productModel.js';
import { User } from './userModels.js';

export const Voucher = db.define(
  'vouchers',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

User.hasMany(Voucher, { foreignKey: 'userId' });
Voucher.belongsTo(User, { foreignKey: 'userId' });
Product.hasOne(Voucher, { foreignKey: 'productId' });
Voucher.belongsTo(Product, { foreignKey: 'productId' });
