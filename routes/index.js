import express from 'express';
import {
  Login,
  deleteUser,
  editUser,
  getPelapakByID,
  getUserById,
  getUserPelapak,
  getUsers,
  logout,
  register,
  searchPelapak,
  searchUserByName
} from '../controller/user.js';
import { getToken, refresh } from '../middleware/refresh.js';
import {
  addProduct,
  deleteProductById,
  editProductById,
  getProductByIdUser,
  getProductByid,
  getProducts,
  searchProductByName,
  searchProductByPelapak,
  upload
} from '../controller/product.js';
import {
  getOrders,
  getOrderById,
  createOrder,
  deleteOrderById,
  editOrderById,
  getOrdersByUserId,
  getMonthlySales,
  getOrderByPelapakId
} from '../controller/order.js';
import {
  countVoucherUsagePerMonth,
  createVoucher,
  deleteVoucherById,
  deleteVoucherUsageByID,
  deleteVoucherUsageById,
  editVoucherById,
  getAllVoucherUsages,
  getVoucherById,
  getVoucherByUserId,
  getVoucherUsageByUserId,
  getVouchers,
  giveVoucher,
  searchVoucher
} from '../controller/voucher.js';
import { checkToken } from '../middleware/auth.js';

const router = express.Router();

// user
router.get('/api/v1/token', refresh);
router.get('/api/v1/getAllUsers', getUsers);
router.get('/api/v1/getUser/:userId', getUserById);
router.get('/api/v1/getToken/:userId', getToken);
router.post('/api/v1/user/register', register);
router.post('/api/v1/login', Login);
router.post('/api/v1/logout', logout);
router.delete('/api/v1/deleteUser/:userId', deleteUser);
router.put('/api/v1/editUser/:userId', editUser);
router.get('/api/v1/searchUser', searchUserByName);
router.get('/api/v1/pelapak', getUserPelapak);
router.get('/api/v1/pelapak/search', searchPelapak);
router.get('/api/v1/getPelapakById/:id', getPelapakByID);

// product
router.get('/api/v1/products', getProducts); //done
router.get('/api/v1/product/:productId', getProductByid); //done
router.get('/api/v1/user/:pelapakId', getProductByIdUser); //done
router.post('/api/v1/addProduct', upload.array('image'), addProduct); //done
router.delete('/api/v1/product/:productId', deleteProductById); //done
router.patch('/api/v1/editProduct/:productId', upload.array('image'), editProductById); //done
router.get('/api/v1/searchProduct', searchProductByName);
router.get('/api/v1/searchProductPelapak/:pelapakId', searchProductByPelapak);

// order
router.get('/api/v1/orders', getOrders); //done
router.get('/api/v1/order/:orderId', getOrderById); //done
router.get('/api/v1/orderUser/:userId', getOrdersByUserId); //done
router.post('/api/v1/orders', createOrder); //done
router.delete('/api/v1/deleteOrder/:orderId', deleteOrderById);
router.put('/api/v1/editOrder/:orderId', editOrderById);
router.get('/api/v1/getMountly', getMonthlySales); //done
router.get('/api/v1/orderPelapak/:pelapakId', getOrderByPelapakId); //done

// voucher
router.get('/api/v1/vouchers', checkToken, getVouchers); //done
router.get('/api/v1/voucher/:voucherId', getVoucherById); //done
router.get('/api/v1/userVoucher/:userId', getVoucherByUserId); //done
router.post('/api/v1/createVoucher', createVoucher); //done
router.put('/api/v1/editVoucher/:voucherId', editVoucherById); //done
router.delete('/api/v1/deleteVoucher/:voucherId', deleteVoucherById); //done
router.delete('/api/v1/deleteVoucherUsage/:voucherId', deleteVoucherUsageByID);
router.get('/api/v1/searchVoucher', searchVoucher);
router.post('/api/v1/giveVoucher', giveVoucher); //done
router.get('/api/v1/getAllvoucherUsage', getAllVoucherUsages); //done
router.delete('/api/v1/deleteVoucherUser/:id', deleteVoucherUsageById); //done
router.get('/api/v1/voucherUsageUser/:userId', getVoucherUsageByUserId);
router.get('/api/v1/getVoucherPerMounth', countVoucherUsagePerMonth);

export default router;
