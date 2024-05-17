import express from "express";
import { login, logout, register } from "../controllers/auth.controller.js";

const router = express.Router();

// new user (username, email, password) to save into mongoDB
router.post("/register", register);
// user (username, email) to save into mongoDB
router.post("/login", login);
// logout
router.post("/logout", logout);

export default router;
