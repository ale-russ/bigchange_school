const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const User = require("../models/UserModel");

const router = express.Router();

router.get(
  "/",
  [authMiddleware, roleMiddleware(["admin"])],
  async (req, res, next) => {
    try {
      const { role } = req.query;
      const query = role ? { role } : {};
      const users = await User.find(query).select("-password");
      const formattedUsers = users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        classes: user.classes,
      }));
      res.status(200).json(formattedUsers);
    } catch (err) {
      next(err);
    }
  }
);

// Update a user (admin - only)
router.put(
  "/:id",
  [authMiddleware, roleMiddleware(["admin"])],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, role, phoneNumber, address } = req.body;

      // validate input
      if (!name || !email || !role || !phoneNumber)
        return res.status(400).json({
          message: "Name, email, role, and phone number are required",
        });

      // check if email is taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser)
        return res.status(400).json({ message: "Email already in use" });

      const existingPhoneNumber = await User.findOne({
        phoneNumber,
        _id: { $ne: id },
      });
      if (existingPhoneNumber)
        return res.status(400).json({ message: "Phone number already in use" });

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { name, email, role, phoneNumber, address },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser)
        return res.status(400).json({ message: "User not found" });

      // Transform _id to id
      const formattedUser = {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
      };

      return res.status(200).json({ formattedUser });
    } catch (err) {
      next(err);
    }
  }
);

// Delete a user (admin only)
router.delete(
  "/:id",
  [authMiddleware, roleMiddleware(["admin"])],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser)
        return res.status(400).json({ message: "User not found" });

      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);
module.exports = router;
