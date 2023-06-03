import express from 'express';
import {
  Login,
  deleteUser,
  editUser,
  getUserById,
  getUsers,
  logout,
  register
} from '../controller/user.js';
import { authenticateToken, refresh } from '../middleware/refresh.js';
import {
  addProduct,
  deleteProductById,
  editProductById,
  getProductByIdUser,
  getProductByid,
  getProducts,
  upload
} from '../controller/product.js';
import {
  getOrders,
  getOrderById,
  createOrder,
  deleteOrderById,
  editOrderById
} from '../controller/order.js';
import {
  createVoucher,
  deleteVoucherById,
  editVoucherById,
  getVoucherById,
  getVoucherByUserId,
  getVouchers
} from '../controller/voucher.js';

const router = express.Router();

// user
router.get('/api/v1/token', refresh);
router.get('/api/v1/getAllUsers', getUsers);
router.get('/api/v1/getUser/:userId', getUserById);
router.post('/api/v1/user/register', register);
router.post('/api/v1/login', Login);
router.post('/api/v1/logout', logout);
router.delete('/api/v1/deleteUser/:userId', deleteUser);
router.put('/api/v1/editUser/:userId', authenticateToken, editUser);

// product
router.get('/api/v1/products', getProducts);
router.get('/api/v1/product/:productId', getProductByid);
router.get('/api/v1/user/:pelapakId', getProductByIdUser);
router.post('/api/v1/addProduct', upload.array('image'), addProduct);
router.delete('/api/v1/product/:productId', deleteProductById);
router.patch('/api/v1/editProduct/:productId', upload.array('image'), editProductById);

// order
router.get('/api/v1/orders', getOrders);
router.get('/api/v1/order/:orderId', getOrderById);
router.post('/api/v1/orders', createOrder);
router.delete('/api/v1/deleteOrder/:orderId', deleteOrderById);
router.put('/api/v1/editOrder/:orderId', editOrderById);

// voucher
router.get('/api/v1/vouchers', getVouchers);
router.get('/api/v1/voucher/:voucherId', getVoucherById);
router.get('/api/v1/userVoucher/:userId', getVoucherByUserId);
router.post('/api/v1/createVoucher', createVoucher);
router.put('/api/v1/editVoucher/:voucherId', editVoucherById);
router.delete('/api/v1/deleteVoucher/:voucherId', deleteVoucherById);

export default router;
