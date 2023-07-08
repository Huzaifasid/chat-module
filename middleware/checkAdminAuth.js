import User from "../models/User.js";

export const checkAdminAuth = async (req, res, next) => {
  // console.log(req.session);
  // console.log("req.session.user", req.session.user);
  if (req.session.user) {
    const user = await User.findOne({ _id: req.session.user }).populate("role");
    console.log("user");
    if (user?.role?.role === "admin") {
      req.user = user;
      return next();
    }
  }
  return next(new Error("Only Admin Can access this route", "invalid", 401));
};
