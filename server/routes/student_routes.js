const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const Student = require("../models/student_model");
const Parent = require("../models/ParentModel");
const { body, validationResult } = require("express-validator");
const Class = require("../models/ClassModel");

const router = express.Router();

// Get all students (admin - only)
router.get(
  "/",
  [authMiddleware, roleMiddleware(["admin"])],
  async (req, res, next) => {
    try {
      const students = await Student.find().populate("class", "name");
      const formattedStudents = students.map((student) => ({
        id: student._id.toString(),
        name: student.name,
        phoneNumber: student.phoneNumber,
        address: student.address,
        class: student.classId
          ? { id: student.classId._id.toString, name: student.classId.name }
          : null,
      }));
      res.status(200).json(formattedStudents);
    } catch (err) {
      next(err);
    }
  }
);

// Create a student (admin or teacher)
router.post(
  "/",
  [
    authMiddleware,
    roleMiddleware(["admin", "teacher"]),
    body("name").notEmpty().withMessage("Name is required"),
    body("phoneNumber")
      .isMobilePhone("any")
      .withMessage("Phone number is required"),
    body("address").isString().withMessage("Invalid Address"),
    body("parentPhoneNumber")
      .isMobilePhone("any")
      .withMessage("Parent's Phone number is required"),
    body("level").optional().isString().withMessage("Invalid Level"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array });

      const {
        name,
        phoneNumber,
        address,
        parentPhoneNumber,
        classId,
        parentIds,
        level,
      } = req.body;

      // Validate parentIds
      if (parentIds && parentIds.length > 0) {
        const parents = await Parent.find({ _id: { $in: parentIds } });
        if (parents.length !== parentIds.length) {
          return res.status(400).json({ message: "Invalid parent IDs" });
        }
      }

      // validate classId and teacher permission
      if (classId) {
        const classData = await Class.findById(classId);
        if (!classData)
          return res.status(400).json({ message: "Invalid Class ID" });

        if (
          req.user.role === "teacher" &&
          classData.teacherId.toString() !== req.user.id
        )
          return res
            .status(403)
            .json({ message: "Not authorized to add to this class" });
      }

      // Check for existing student with same phone number
      const existingStudent = await User.findOne({ phoneNumber });
      if (existingStudent)
        return res.status(400).json({
          message: "Student with this phone number is already registered",
        });

      // Create Student
      const student = new Student({
        name,
        phoneNumber,
        address,
        level,
        parentIds,
        classId: classId || null,
      });

      // update parent record
      await Parent.updateMany(
        { _id: { $in: parentIds } },
        { $addToSet: { childrenIds: student._id } }
      );

      // Update class Record
      if (classId)
        await Class.findByIdAndUpdate(classId, {
          $addToSet: { studentIds: student._id },
        });

      // Populate classId for response:
      const populatedStudent = await Student.findById(student._id).populate(
        "classId",
        "name teacherId"
      );
      const formattedStudent = {
        if: populatedStudent._id.toString(),
        name: populatedStudent.name,
        phoneNumber: populatedStudent.phoneNumber,
        address: populatedStudent.address,
        level: populatedStudent.level,
        class: populatedStudent.classId
          ? {
              id: populatedStudent.classId._id.toString(),
              name: populatedStudent.classId.name,
            }
          : null,
        parentIds: populatedStudent.parentIds.map((id) => id.toString()),
      };
      res.status(201).json(formattedStudent);
    } catch (err) {
      console.log("Error: ", err);
      return res(500).json({ message: "Internal Server Error" });
    }
  }
);

// Update a Student (admin and teacher)
router.put(
  "/:id",
  [
    authMiddleware,
    roleMiddleware(["admin", "teacher"]),
    body("name").notEmpty().withMessage("Name is required"),
    body("phoneNumber")
      .optional()
      .isMobilePhone("any")
      .withMessage("Invalid phone number"),
    body("address").notEmpty().withMessage("Address is required"),
    body("grade").notEmpty().withMessage("Grade is required"),
    body("parentIds")
      .isArray({ min: 1 })
      .withMessage("At least one parent ID is required"),
    body("classId").optional().isMongoId().withMessage("Invalid class ID"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { id } = req.params;
      const { name, phoneNumber, address, grade, parentIds, classId } =
        req.body;

      const student = await Student.findById(id);

      // Validate parentIds
      if (parentIds && parentIds.length > 0) {
        const parents = await Parent.find({ _id: { $in: parentIds } });
        if (parents.length !== parentIds.length)
          return res.status(400).json({ message: "Invalid parent IDs" });
      }

      // Validate classId and teacher permissions
      if (classId) {
        const classData = await Class.findById(classId);
        if (!classData)
          return res.status(400).json({ message: "Invalid class ID" });

        if (
          req.user.role === "teacher" &&
          classData.teacherId.toString() !== req.user.id
        )
          return res
            .status(403)
            .json({ message: "Not authorized to modify this class" });
      }

      // Check for phone number uniqueness (if provided)
      // const existingStudent = await Student.findOne({
      //   phoneNumber,
      //   _id: { $ne: id },
      // });
      // if (existingStudent)
      //   return res.status(400).json({ message: "Phone number already in use" });

      await student.save();

      // Update student
      const oldClassId = student.classId;
      student.set({
        name,
        phoneNumber,
        address,
        level,
        parentIds,
        classId: classId || null,
        updatedAt: Date.now(),
      });
      await student.save();

      // Update parent records
      await Parent.updateMany(
        { childrenIds: student._id, _id: { $nin: parentIds } },
        { $pull: { childrenIds: student._id } }
      );
      await Parent.updateMany(
        { _id: { $in: parentIds } },
        { $addToSet: { childrenIds: student._id } }
      );

      // Update class records
      if (oldClassId && oldClassId.toString() !== classId)
        await Class.findByIdAndUpdate(oldClassId, {
          $pull: { studentIds: student._id },
        });

      if (classId)
        await Class.findByIdAndUpdate(classId, {
          $addToSet: { studentIds: student._id },
        });

      // Populate classId for response
      const populatedStudent = await Student.findById(student._id).populate(
        "classId",
        "name"
      );
      const formattedStudent = {
        id: populatedStudent._id.toString(),
        name: populatedStudent.name,
        phoneNumber: populatedStudent.phoneNumber,
        address: populatedStudent.address,
        level: populatedStudent.grade,
        class: populatedStudent.classId
          ? {
              id: populatedStudent.classId._id.toString(),
              name: populatedStudent.classId.name,
            }
          : null,
        parentIds: populatedStudent.parentIds.map((id) => id.toString()),
      };

      res.status(200).json(formattedStudent);
    } catch (err) {
      next(err);
    }
  }
);

// Remove a student from class (teacher or admin)
router.put(
  "/:id/remove-from-class",
  [authMiddleware, roleMiddleware(["admin", "teacher"])],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const student = await Student.findById(id);

      if (!student)
        return res.status(404).json({ message: "Student not found" });

      // Validate teacher permission
      const classData = await Class.findById(student.classId);
      if (
        req.user.role === "teacher" &&
        classData.teacherId.toString() !== req.user.id
      )
        return res
          .status(403)
          .json({ message: "Not authorized to modify class" });

      // Remove student from class
      await Class.findByIdAndUpdate(student.classId, {
        $pull: { studentIds: student._id },
      });

      student.classId = null;
      student.updatedAt = Date.now();
      await student.save();

      // Populate classId for response
      const populatedStudent = await Student.findById(student._id).populate(
        "classId",
        "name"
      );

      const formattedStudent = {
        id: populatedStudent._id.toString(),
        name: student.name,
        phoneNumber: student.phoneNumber,
        address: student.address,
        level: student.level,
        parentIds: student.parentIds.map((id) => id.toString()),
      };
    } catch (err) {
      next(err);
    }
  }
);

// Delete a student (admin - only)
router.delete(
  "/:id",
  [authMiddleware, roleMiddleware(["admin"])],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const student = await Student.findById(id);

      if (!student)
        return res.status(400).json({ message: "Student not found" });

      // Remove student from class
      if (student.classId)
        await Class.findByIdAndUpdate(student.classId, {
          $pull: { studentIds: student._id },
        });

      //  Remove student from parents
      await Parent.updateMany(
        { childrenIds: student._id },
        { $pull: { childrenIds: student._id } }
      );

      // Delete Parents with no children(optional)
      const parents = await Parent.find({ childrenIds: { $size: 0 } });
      await Parent.deleteMany({ _id: { $in: parents.map((p) => p._id) } });

      // Delete Student
      await Student.deleteOne({ _id: id });

      res.status(200).json({ message: "Student deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
