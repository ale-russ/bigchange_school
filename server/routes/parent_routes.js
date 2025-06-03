const express = require("express");

const Parent = require("../models/ParentModel");
const Student = require("../models/student_model");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { body } = require("express-validator");

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
    body("phoneNumber")
      .isMobilePhone()
      .notEmpty()
      .withMessage("Invalid Phone number"),
    body("address").notEmpty().withMessage("Address is required"),
  ],
  async (req, res, next) => {
    try {
      const { fullName, phoneNumber, childrenIds, address } = req.body;

      // Validate childrenIds
      if (childrenIds && childrenIds.length > 0) {
        const students = await Student.find({ _id: { $in: childrenIds } });
        if (students.length !== childrenIds.length)
          return res.status(400).json({ message: "Invalid Student IDs" });
      }

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
      res.status(201).json(parent);
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
    body("phoneNumber")
      .isMobilePhone()
      .notEmpty()
      .withMessage("Invalid Phone number"),
    body("childrenIds").notEmpty().withMessage("Children Id is required"),
    body("address").notEmpty().withMessage("Address is required"),
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fullName, phoneNumber, childrenIds, address } = req.body;

      const parent = await Parent.findById(id);
      if (!parent) return res.status(404).json({ message: "Parent not found" });

      // Validate childrenIds
      if (childrenIds) {
        const students = await Student.find({ _id: { $in: childrenIds } });
        if (students.length !== childrenIds.length)
          return res.status(400).json({ message: "Invalid Student IDs" });

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
        if (childrenIds) {
          // Remove parent from old student
          await Student.updateMany(
            {
              parentIds: parent._id,
              _id: { $nin: childrenIds },
            },
            { $pull: { parentIds: parent._id } }
          );

          // Add parent to new students
          await Student.updateMany(
            { _id: { $in: childrenIds } },
            { $addToSet: { parentIds: parent._id } }
          );
        }

        res.json(parent);
      }
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
