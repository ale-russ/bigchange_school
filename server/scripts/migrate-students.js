const mongoose = require("mongoose");

const User = require("../models/UserModel");
const Student = require("../models/student_model");

async function migrateStudents() {
  try {
    await mongoose.connect("mongodb://localhost:27017/school", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    const students = await User.find({ role: "student" });
    console.log(`Found ${students.length} students to migrate`);

    for (const user of students) {
      const student = new Student({
        name: user.name,
        phoneNumber: user.phoneNumber,
        address: user.address,
      });

      await student.save;
      console.log(`Migrated student: ${user.phoneNumber}`);
    }
    await User.deleteMany({ role: "student" });
    console.log("Deleted student records from users collection");

    console.log("Migration completed");
    process.exit(0);
  } catch (err) {
    console.log("Migration Failed");
    process.exit(1);
  }
}

migrateStudents();
