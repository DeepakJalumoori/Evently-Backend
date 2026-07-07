const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const authMiddleware = require("../Middlewares/authMiddleware");

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

module.exports = router;
