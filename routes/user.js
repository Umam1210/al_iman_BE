import express from "express";
import { Login, editUser, getUserById, getUsers, logout, register } from "../controller/user.js";
import { refresh } from "../controller/refresh.js";
import { getProducts } from "../controller/product.js";

const router = express.Router();

router.post("/api/v1/user/register", register);
router.get("/api/v1/getAllUsers", getUsers);
router.post("/api/v1/login", Login);
router.get("/api/v1/token", refresh);
router.get("/api/v1/products", getProducts);
router.post("/api/v1/logout", logout);
router.get("/api/v1/getUser/:userId", getUserById);
router.put("/api/v1/editUser/:userId", editUser);

export default router;
