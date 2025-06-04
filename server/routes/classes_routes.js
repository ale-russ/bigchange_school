const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const roleMiddleWare = require("../middleware/roleMiddleware");
const ClassModel = require("../models/ClassModel");
const User = require("../models/UserModel");
const Student = require("../models/student_model");
const { body } = require("express-validator");

const router = express.Router();

// Get all classes (admin or teacher)
router.get(
  "/",
  [authMiddleware, roleMiddleware(["admin"])],
  async (req, res, next) => {
    try {
      const classes = await ClassModel.find()
        .populate("teacherId", "name email phoneNumber role")
        .populate("studentIds", "name phoneNumber address level");
      const formattedClasses = classes.map((cls) => ({
        id: cls._id.toString(),
        name: cls.name,
        level: cls.level,
        teacherId: cls.teacherId._id.toString(),
        teacher: {
          id: cls.teacherId._id.toString(),
          name: cls.teacherId.name,
          email: cls.teacherId.email,
          phoneNumber: cls.teacherId.phoneNumber,
        },
        studentIds: cls.studentIds.map((s) => s._id.toString()),
        students: cls.studentIds.map((s) => ({
          id: s._id.toString(),
          name: s.name,
          phoneNumber: s.phoneNumber,
          address: s.address,
          level: s.level,
        })),
      }));
      res.status(200).json(formattedClasses);
    } catch (err) {
      next(err);
    }
  }
);

// Create a class (admin and teacher )
router.post(
  "/",
  [authMiddleware, roleMiddleware(["admin", "teacher"])],
  async (req, res, next) => {
    console.log("in create class route", req.body);
    try {
      const { name, teacherId, studentIds } = req.body;

      if (!name || !teacherId)
        return res
          .status(400)
          .json({ message: "Name of the class and teacher are required" });

      const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
      console.log("TEacher: ", teacher);
      if (!teacher)
        return res.status(400).json({ message: "Teacher not found" });

      const students = studentIds?.length
        ? await Student.find({ _id: { $in: studentIds } })
        : [];

      if (studentIds?.length && students.length !== studentIds.length)
        return res
          .status(400)
          .json({ message: "One or more invalid students" });

      const newClass = new ClassModel({
        name,
        teacher: teacher,
        teacherId: teacher._id,
        students: studentIds || [],
      });

      await newClass.save();

      // Update student's class field
      if (studentIds?.length) {
        await Student.updateMany(
          { _id: { $in: studentIds } },
          { class: newClass._id }
        );
      }

      const populatedClass = await ClassModel.findById(newClass._id)
        .populate("teacherId", "name email phoneNumber")
        .populate("studentIds", "name phoneNumber");

      res.status(200).json({
        id: populatedClass._id.toString(),
        name: populatedClass.name,
        teacher: {
          id: populatedClass.teacherId._id.toString(),
          name: populatedClass.teacherId.name,
          email: populatedClass.teacherId.email,
          phoneNumber: populatedClass.teacherId.phoneNumber,
        },
        students: populatedClass.studentIds?.map((student) => ({
          id: student._id.toString(),
          name: student.name,
          phoneNumber: student.phoneNumber,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update a class (admin and teacher)
router.put(
  "/:id",
  [authMiddleware, roleMiddleWare(["admin", "teacher"])],
  body("name").optional().notEmpty().withMessage("Class name cannot be empty"),
  body("teacherId").optional().isMongoId().withMessage("Invalid teacher ID"),
  body("level").notEmpty().withMessage("Level is required"),
  body("studentIds")
    .optional()
    .isArray()
    .withMessage("Student IDs must be an array"),
  body("studentIds.*").optional().isMongoId().withMessage("Invalid student ID"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log("id: ", id);
      const { name, teacherId, studentIds, level } = req.body;
      console.log("body: ", name, teacherId, studentIds, level);

      const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
      if (!teacher)
        return res.status(400).json({ message: "No teacher found" });

      const students = studentIds?.length
        ? await Student.find({ _id: { $in: studentIds } })
        : [];

      if (studentIds?.length && students.length !== studentIds.length)
        return res
          .status(400)
          .json({ message: "One or more invalid students" });

      const updatedClass = await ClassModel.findByIdAndUpdate(
        id,
        { name, teacher: teacherId, students: students, level: level || [] },
        { new: true }
      )
        .populate("teacherId", "name email phoneNumber")
        .populate("studentIds", "name phoneNumber address level");

      if (!updatedClass)
        return res.status(404).json({ message: "Class not found" });

      // Update students class field
      await Student.updateMany({ class: id }, { $unset: { class: "" } });

      if (studentIds?.length)
        await Student.updateMany({ _id: { $in: studentIds } }, { class: id });

      res.status(200).json({
        id: updatedClass._id.toString(),
        name: updatedClass.name,
        level: updatedClass.level,
        teacher: {
          id: updatedClass.teacherId._id.toString(),
          name: updatedClass.teacherId.name,
          email: updatedClass.teacherId.email,
          phoneNumber: updatedClass.teacherId.phoneNumber,
        },
        students: updatedClass.studentIds.map((student) => ({
          id: student._id.toString(),
          name: student.name,
          phoneNumber: student.phoneNumber,
          address: student.address,
          level: student.level,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

// Delete class (admin only)
router.delete(
  "/:id",
  [authMiddleware, roleMiddleware(["admin"])],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const classData = await ClassModel.findById(id);
      if (!classData)
        return res.status(404).json({ message: "Class not found" });

      // Update student records
      await Student.updateMany({ classId: id }, { classId: null });

      await ClassModel.deleteOne({ _id: id });
      res.status(200).json({ message: "Class deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
