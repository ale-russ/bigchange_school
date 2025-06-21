const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const Student = require("../models/student_model");
const Class = require("../models/ClassModel");
const Parent = require("../models/ParentModel");
const User = require("../models/UserModel");

const router = express.Router();

router.get(
  "/students",
  [authMiddleware, roleMiddleware(["teacher"])],
  async (req, res) => {
    try {
      const teacherId = req.user.userId;

      // 1. Get teacher with class info populated
      const teacher = await User.findById(teacherId).populate("classes");
      if (!teacher)
        return res.status(404).json({ message: "Teacher not found" });

      const classIds = teacher.classes.map((cls) => cls._id);

      // 2. Get students with class & parent info
      const students = await Student.find({ classId: { $in: classIds } })
        .populate("classId", "name level")
        .populate("parentIds", "fullName phoneNumber address");

      // 3. Group students under their respective class
      const classMap = new Map();
      teacher.classes.forEach((cls) => {
        classMap.set(cls._id.toString(), {
          id: cls._id.toString(),
          name: cls.name,
          level: cls.level,
          students: [],
        });
      });

      students.forEach((student) => {
        const classId = student.classId?._id?.toString();
        if (!classMap.has(classId)) return;

        classMap.get(classId).students.push({
          id: student._id.toString(),
          name: student.name,
          phoneNumber: student.phoneNumber,
          address: student.address,
          level: student.level,
          parentIds: student.parentIds.map((parent) => ({
            id: parent._id.toString(),
            fullName: parent.fullName,
            phoneNumber: parent.phoneNumber,
            address: parent.address,
          })),
        });
      });

      // 4. Create final teacher payload
      const teacherPayload = {
        id: teacher._id.toString(),
        name: teacher.name,
        email: teacher.email,
        phoneNumber: teacher.phoneNumber,
        address: teacher.address,
        classes: Array.from(classMap.values()),
      };

      console.log("teacherPayload: ", teacherPayload);

      res.status(200).json({ teacher: teacherPayload });
    } catch (err) {
      console.error("Error: ", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
