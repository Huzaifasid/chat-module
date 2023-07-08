import bcrypt from "bcrypt";
import User from "../models/User.js";
import HttpError from "../utils/httpError.js";
import { asyncHandler } from "../middleware/async.js";
import { Role } from "../models/role.js";

// User registration
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, cpassword } = req.body;
  if (!name || !email || !phone || !password || !cpassword) {
    return res.status(422).json({ error: "Please fill all the fields" });
  }

  const userExist = await User.findOne({ email: email });
  if (userExist) {
    return res.status(422).json({ error: "Email Already Exists" });
  } else if (password !== cpassword) {
    return res.status(422).json({ error: "Passwords do not match" });
  } else {
    let userRole = await Role.findOne({ role: "user" });
    if (!userRole) {
      userRole = await Role.create({ role: "user" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      cpassword,
      role: userRole._id,
    });

    res.status(201).json({
      success: true,
      message: "User registration successful",
      user,
    });
  }
});

// login User

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please fill in the required fields." });
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials." });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials." });
  }
  req.session.user = user._id;
  res.json({ success: true, message: "User logged in successfully.", user });
  // console.log(user);
});

// update user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res
      .status(400)
      .json({ error: "Please fill in the required fields." });
  }
  const user = await User.findByIdAndUpdate(
    id,
    { name, email, phone },
    { new: true }
  );
  if (!user) {
    return res
      .status(400)
      .json({ message: `Can't find any user with given ID ${id}` });
  } else {
    res.status(200).json({ success: true, message: "User Updated", user });
  }
});

// delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  // when user not found in database
  if (!user) {
    return res
      .status(400)
      .json({ message: `Can't find any user with given ID ${id}` });
  } else {
    res.status(200).json({ success: true, message: "User Deleted" });
  }
});

// get users
export const getUsers = asyncHandler(async (req, res) => {
  const allUsers = await User.find({});
  res.status(200).json({ success: true, allUsers });
});

//Check Admin Role
export const adminRole = asyncHandler(async (req, res) => {
  // Check if an admin role exists
  let adminRole = await Role.findOne({ role: "admin" });
  // console.log("adminRole", adminRole);

  // If admin role doesn't exist, create it
  if (!adminRole) {
    adminRole = await Role.create({ role: "admin" });
  }

  // Check if an admin user exists
  let adminUser = await User.findOne({ role: adminRole._id });

  // If admin user doesn't exist, create it
  if (!adminUser) {
    adminUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      cpassword: req.body.cpassword,
      role: adminRole._id,
    });

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully.",
      user: adminUser,
    });
  } else {
    return res.status(200).json({
      message: "Admin user already exists.",
      user: adminUser,
    });
  }
});
