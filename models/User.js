import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import mongooseAutoPopulate from "mongoose-autopopulate";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    cpassword: {
      type: String,
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      // default: "user",
    },
  },
  { timestamps: true }
);

// hashing password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);

    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
});

userSchema.plugin(mongooseAutoPopulate);

const User = mongoose.model("User", userSchema);

export default User;
