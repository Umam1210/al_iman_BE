import { DataTypes, Sequelize } from 'sequelize';
import db from '../config/database.js';
import { Product } from './productModel.js';

export const Users = db.define(
  'users',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    no_kk: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.STRING
    },
    kontak: {
      type: DataTypes.STRING
    },
    alamat: {
      type: DataTypes.STRING
    },
    refreshToken: {
      type: DataTypes.STRING(500)
    }
  },
  {
    freezeTableName: true
  }
);

Users.hasMany(Product, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

Product.belongsTo(Users, {
  foreignKey: 'userId'
});
