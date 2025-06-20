const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Student = require("../models/student_model");
const Class = require("../models/ClassModel");
const Parent = require("../models/ParentModel");
const roleMiddleware = require("../middleware/roleMiddleware");
const User = require("../models/UserModel");

const router = express.Router();

// Get all students of a teacher
router.get(
  "/students",
  [authMiddleware, roleMiddleware(["teacher"])],
  async (req, res, next) => {
    try {
      const teacherId = req.user.userId;

      // Get the teacher classes
      const teacher = await User.findById(teacherId);
      if (!teacher)
        return res.status(404).json({ message: "Teacher not found" });

      console.log("teacher: ", teacher);

      const classList = teacher.classes.map((cls) => ({
        id: cls._id.toString(),
        name: cls.name,
        level: cls.level,
        students: cls.students,
      }));

      const classIds = teacher.classes;

      console.log("classIds: ", classIds);

      //   Find students in those classes
      const students = await Student.find({
        classId: { $in: classIds },
      })
        .populate("classId", "name phoneNumber address level")
        .populate("parentIds", "fullName phoneNumber address");

      console.log("students in teacher route: ", students);
      // Format and return
      const formattedStudents = students.map((student) => ({
        id: student._id.toString(),
        name: student.name,
        phoneNumber: student.phoneNumber,
        address: student.address,
        class: student.classId
          ? { id: student.classId._id.toString(), name: student.classId.name }
          : null,
        level: student.level,
        parents: student.parentIds.map((parent) => ({
          id: parent._id.toString(),
          name: parent.fullName,
          phoneNumber: parent.phoneNumber,
          address: parent.address,
        })),
      }));

      res.status(200).json({
        students: formattedStudents,
        classes: classList,
      });
    } catch (err) {
      console.log("Error: ", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
