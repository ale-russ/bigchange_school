const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  childrenIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Parent", parentSchema);
