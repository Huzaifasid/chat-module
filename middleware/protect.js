import { UserModel } from "../models/User.js";

export const protect = async (req, res, next) => {
  // console.log(req.session);
  // console.log("req.session.user", req.session.user);
  if (req.session.user) {
    const user = await UserModel.findOne({ _id: req.session.user });
    console.log(user);
    if (user) {
      req.user = user;
      return next();
    }
  }
  return next(
    new Error("Tokens are missing or invalid", "invalid-tokens", 401)
  );
};
