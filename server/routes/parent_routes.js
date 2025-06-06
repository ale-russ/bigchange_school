const express = require("express");

const Parent = require("../models/ParentModel");
const Student = require("../models/student_model");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Get all parents (admin or teacher)
router.get(
  "/",
  [authMiddleware, roleMiddleware(["admin", "teacher"])],
  async (req, res, next) => {
    try {
      const parents = await Parent.find().populate(
        "childrenIds",
        "name phoneNumber"
      );
      const formattedParents = parents.map((parent) => ({
        id: parent._id.toString(),
        fullName: parent.fullName,
        phoneNumber: parent.phoneNumber,
        address: parent.address,
        children: parent.childrenIds.map((child) => ({
          id: child._id.toString(),
          name: child.name,
        })),
      }));
      res.status(200).json(formattedParents);
    } catch (err) {
      next(err);
    }
  }
);

// Add a parent (Teacher or Admin)
router.post(
  "/",
  [
    authMiddleware,
    roleMiddleware(["admin", "teacher"]),
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("phoneNumber").notEmpty().withMessage("Invalid Phone number"),
    body("address").notEmpty().withMessage("Address is required"),
    body("childrenIds")
      .optional()
      .isArray()
      .withMessage("Children IDs must be an array"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ errors: "Please fill in the required fields" });
      }
      const { fullName, phoneNumber, childrenIds, address } = req.body;

      // Validate childrenIds
      if (childrenIds && childrenIds.length > 0) {
        const students = await Student.find({ _id: { $in: childrenIds } });
        if (students.length !== childrenIds.length)
          return res.status(400).json({ message: "Invalid Student IDs" });
      }

      // Check for existing parent with the same phone number
      const existingParent = await Parent.findOne({ phoneNumber });
      if (existingParent)
        return res.status(400).json({
          message: "Parent with this phone number is already registered",
        });

      const parent = new Parent({
        fullName,
        phoneNumber,
        childrenIds,
        address,
      });
      await parent.save();

      // Update student record;
      if (childrenIds && childrenIds.length > 0) {
        await Student.updateMany(
          { _id: { $in: childrenIds } },
          { $addToSet: { parentIds: parent._id } }
        );
      }

      const populatedParent = await Parent.findById(parent._id).populate(
        "childrenIds",
        "name phoneNumber level class"
      );

      res.status(201).json({
        id: populatedParent._id.toString(),
        fullName: populatedParent.fullName,
        phoneNumber: populatedParent.phoneNumber,
        address: populatedParent.address,
        children: populatedParent.childrenIds.map((child) => ({
          id: child._id.toString(),
          name: child.name,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

// Edit a parent (Teacher or Admin)
router.put(
  "/:id",
  [
    authMiddleware,
    roleMiddleware(["teacher", "admin"]),
    body("fullName").notEmpty().withMessage("Name is Required"),
    body("phoneNumber").isMobilePhone().withMessage("Invalid phone number"),
    body("childrenIds").isArray().withMessage("Children ID is required"),
    body("address").notEmpty().withMessage("Address is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { fullName, phoneNumber, childrenIds, address } = req.body;

      const parent = await Parent.findById(id);
      if (!parent) return res.status(404).json({ message: "Parent not found" });

      // Validate childrenIds
      if (childrenIds) {
        const students = await Student.find({ _id: { $in: childrenIds } });
        if (students.length !== childrenIds.length)
          return res.status(400).json({ message: "Invalid Student IDs" });

        // Check for phone number uniqueness
        const existingParent = await Parent.findOne({
          phoneNumber,
          _id: { $ne: id },
        });
        if (existingParent)
          return res
            .status(400)
            .json({ message: "Phone number already in use" });

        // update parent
        parent.set({
          fullName,
          phoneNumber,
          childrenIds,
          address,
          updatedAt: Date.now(),
        });

        await parent.save();

        // Update student record
        await Student.updateMany(
          {
            parentIds: parent._id,
            _id: { $nin: childrenIds },
          },
          { $pull: { parentIds: parent._id } }
        );
        // Add parent to new students
        if (childrenIds && childrenIds.length > 0) {
          await Student.updateMany(
            { _id: { $in: childrenIds } },
            { $addToSet: { parentIds: parent._id } }
          );
        }

        const populatedParent = await Parent.findById(id).populate(
          "childrenIds",
          "name phoneNumber level classId address"
        );

        res.status(200).json({
          id: populatedParent._id.toString(),
          fullName: populatedParent.fullName,
          phoneNumber: populatedParent.phoneNumber,
          address: populatedParent.address,
          children: populatedParent.childrenIds.map((child) => ({
            id: child._id.toString(),
            name: child.name,
            phoneNumber: child.phoneNumber,
            level: child.level,
            classId: child.classId,
            address: child.address,
          })),
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

// Delete a parent (admin only)
router.delete(
  "/:id",
  [authMiddleware, roleMiddleware(["admin"])],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const parent = await Parent.findById(id);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      // Remove parent from student records
      await Student.updateMany(
        { parentIds: parent._id },
        { $pull: { parentIds: parent._id } }
      );

      await Parent.deleteOne({ _id: id });
      res.status(200).json({ message: "Parent deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
