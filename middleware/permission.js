import { PermissionModel } from "../models/Permission.js";
import HttpError from "../utils/httpError.js";

export const permissionCheck = (model, operation) => async (req, res, next) => {
  const permission = await PermissionModel.findOne({
    _id: req.user.permission,
  });
  if (permission[model] >= operation) {
    next();
  } else {
    return next(
      new HttpError(
        "User is not authorized for this action",
        "unauthorized",
        401
      )
    );
  }
};
