import express from "express";

import { registerUser, loginUser } from "../controllers/authController.js";
import authMiddleware from "../Middleware/authMiddleware.js";

const router = express.Router();

//Testing authMiddleware by giving token in the header
// router.get("/profile", authMiddleware, (req, res) => {
//   res.status(200).json({
//     success: true,
//     user: req.user,
//   });
// });

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
