import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  role: { type: String },
});
export const Role = mongoose.model("Role", roleSchema);
