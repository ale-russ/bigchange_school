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
  [authMiddleware, roleMiddleware(["admin", "teacher"])],
  async (req, res, next) => {
    try {
      const classes = await ClassModel.find()
        .populate("teacherId", "name email phoneNumber role")
        .populate("studentIds", "name phoneNumber address level");

      const formattedClasses = classes.map((cls) => ({
        id: cls._id.toString(),
        name: cls.name,
        level: cls.level,
        classes: cls?.classes ?? [],
        // teacherId: cls.teacherId ? cls.teacherId._id.toString() : null,
        teacher: cls.teacherId
          ? {
              id: cls.teacherId._id.toString(),
              name: cls.teacherId.name,
              email: cls.teacherId.email,
              phoneNumber: cls.teacherId.phoneNumber,
            }
          : null,
        // studentIds: cls.studentIds.map((s) => s._id.toString()),
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
    try {
      const { name, teacherId, studentIds, level } = req.body;

      if (!name)
        return res
          .status(400)
          .json({ message: "Name of the class is required" });

      let teacher = null;
      let teacherIdValue = null;
      if (teacherId) {
        const teacher = await User.findOne({ _id: teacherId, role: "teacher" });

        if (!teacher)
          return res.status(400).json({ message: "Teacher not found" });

        teacherIdValue = teacher._id;
        teacher.classes = teacher.classes || [];
        if (!teacher.classes.includes(teacherIdValue)) {
          teacher.classes.push(teacherIdValue);
          await teacher.save();
        }
      }

      const students = studentIds?.length
        ? await Student.find({ _id: { $in: studentIds } })
        : [];

      if (studentIds?.length && students.length !== studentIds.length)
        return res
          .status(400)
          .json({ message: "One or more invalid students" });

      const newClass = new ClassModel({
        name,
        teacher: teacher || {},
        teacherId: teacherIdValue,
        students: studentIds || [],
        level: level,
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
        level: populatedClass.level,
        teacher: populatedClass.teacherId
          ? {
              id: populatedClass.teacherId._id.toString(),
              name: populatedClass.teacherId.name,
              email: populatedClass.teacherId.email,
              phoneNumber: populatedClass.teacherId.phoneNumber,
            }
          : null,
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
      const { name, teacherId, studentIds, level } = req.body;

      // Get the existing class to check previous teacher
      const existingClass = await ClassModel.findById(id);
      if (!existingClass)
        return res.status(404).json({ message: "Class not found" });

      const teacher = await User.findOne({ _id: teacherId, role: "teacher" });

      if (!teacher)
        return res.status(400).json({ message: "No teacher found" });

      // Update teacher's classes array
      teacher.classes = teacher.classes || [];
      if (
        !teacher.classes.includes(id) &&
        teacherId !== existingClass.teacherId?.toString()
      ) {
        teacher.classes.push(id);
        await teacher.save();
      }

      // Remove class from previous teacher's classes if teacher changed
      if (
        existingClass.teacherId &&
        (!teacherId || teacherId !== existingClass.teacherId.toString())
      ) {
        const previousTeacher = await User.findById(existingClass.teacherId);
        if (previousTeacher) {
          previousTeacher.classes = previousTeacher.classes.filter(
            (classId) => classId.toString() !== id
          );
          await previousTeacher.save();
        }
      }

      const students = studentIds?.length
        ? await Student.find({ _id: { $in: studentIds } })
        : [];

      if (studentIds?.length && students.length !== studentIds.length)
        return res
          .status(400)
          .json({ message: "One or more invalid students" });

      const updatedClass = await ClassModel.findByIdAndUpdate(
        id,
        { name, teacherId, students: students, level: level || [] },
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
          id: updatedClass?.teacherId
            ? updatedClass?.teacherId?._id.toString()
            : null,
          name: updatedClass?.teacherId ? updatedClass?.teacherId?.name : null,
          email: updatedClass?.teacherId ? updatedClass.teacherId.email : null,
          phoneNumber: updatedClass?.teacherId
            ? updatedClass.teacherId.phoneNumber
            : null,
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
