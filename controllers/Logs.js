import { asyncHandler } from "../middleware/async.js";
import { LogModel } from "../models/Logs.js";

export const createLogs = async (
  userId,
  schemaName,
  method,
  rowId,
  columns
) => {
  try {
    const result = await LogModel.create({
      user: userId,
      schemaName: schemaName,
      method: method,
      rowId: rowId,
      columnsEffected: columns,
    });
  } catch (err) {
    console.log(
      "msg: " + err + ", code: " + " invalid-error" + ", status: " + 500
    );
  }
};

export const getLogs = asyncHandler(async (req, res, next) => {
  req.model = LogModel;
  next();
});
