import express from "express";
import {
  registerUser,
  loginUser,
  adminRole,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/authController.js";
import { checkAdminAuth } from "../middleware/checkAdminAuth.js";

const router = express.Router();

router.get("/getusers", checkAdminAuth, getUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin-role", adminRole);
router.put("/updateuser/:id", checkAdminAuth, updateUser);
router.delete("/deleteuser/:id", checkAdminAuth, deleteUser);

export default router;
