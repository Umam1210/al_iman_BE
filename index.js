import express from "express";
import db from "./config/database.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import Users from "./models/userModels.js";
import Product from "./models/productModel.js";
import router from "./routes/user.js";

const app = express();
const { PORT } = process.env;

app.use(express.json());
app.use(cookieParser());
app.use(router);

const startServer = async () => {
  try {
    await db.authenticate();
    await Users.sync();
    await Product.sync();
    console.log("Connected to the database");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
