const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/UserModel");

const router = express.Router();

// Register route
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Invalid email format"),
    body("password")
      .notEmpty()
      .withMessage("Password must be at least 6 characters long")
      .isLength({ min: 6 }),
    body("phoneNumber")
      .notEmpty()
      // .isMobilePhone("any")
      .withMessage("Phone number is required"),
    body("role")
      .isIn(["student", "admin", "teacher"])
      .isString()
      .withMessage("Invalid Role"),
  ],
  async (req, res, next) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      console.log("body: ", req.body)
      const { name, email, password, role, phoneNumber, address } = req.body;


      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { phoneNumber }],
      });
      console.log(`Existing user: ${existingUser}`);
      if (existingUser)
        return res.status(400).json({ message: "User Already Registered" });

      // Hash password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        phoneNumber,
        address: address || "",
      });
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "90d" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: { id: user._id, name, email, role },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Login route
router.post(
  "/login",
  [
    body("email").notEmpty().withMessage("Invalid email format"),
    body("password")
      .notEmpty()
      .withMessage("Password must be at least 6 characters long")
      .isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty)
        return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });

      if (!user)
        return res.status(400).json({ message: "Invalid email or password" });

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid email or password" });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "90d" }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email,
          role: user.role,
          address: user.address,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
