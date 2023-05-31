import express from 'express';
import { Login, editUser, getUserById, getUsers, logout, register } from '../controller/user.js';
import { authenticateToken, refresh } from '../middleware/refresh.js';
import { addProduct, getProductByIdUser, getProducts, upload } from '../controller/product.js';

const router = express.Router();

router.post('/api/v1/user/register', register);
router.get('/api/v1/getAllUsers', getUsers);
router.post('/api/v1/login', Login);
router.post('/api/v1/logout', logout);
router.get('/api/v1/getUser/:userId', getUserById);
router.get('/api/v1/products', getProducts);
router.get('/api/v1/user/:pelapakId', getProductByIdUser);
router.post('/api/v1/addProduct', upload.array('image'), addProduct);

router.get('/api/v1/token', refresh);
router.put('/api/v1/editUser/:userId', authenticateToken, editUser);

export default router;
