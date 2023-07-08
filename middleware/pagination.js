import { asyncHandler } from "./async.js";
import mongoose from "mongoose";

export const pagination = asyncHandler(async (req, res) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  // Create query string

  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in|ne)\b/g,
    (match) => `$${match}`
  );

  const filters = JSON.parse(queryStr);

  const populate = req.populate;
  const pageNumber = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sortBy;
  let selected;

  if (req.query.select) {
    selected = req.query.select;
  }

  if (req.query.sort) {
    sortBy = req.query.sort;
  } else {
    sortBy = "-createdAt";
  }
  const result = {};

  const model = req.model;
  // console.log("model", req);
  const totalPosts = await model.countDocuments();
  let startIndex = (pageNumber - 1) * limit;
  result.totalPages = Math.ceil(totalPosts / limit);
  result.data = await model
    .find(filters)
    .sort(sortBy)
    .skip(startIndex)
    .limit(limit)
    .populate(populate)
    .select(selected)
    .exec();
  result.limit = limit;
  result.currentPage = pageNumber;
  res.json({ success: true, result: result });
});

export const aggregatedPagination = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };
  console.log("reqQuery", reqQuery);
  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  console.log("queryStr", queryStr);
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  const filters = JSON.parse(queryStr);
  console.log("filters", filters);
  const pageNumber = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sortBy;
  let selected = { __v: 0 };

  if (req.query.select) {
    selected = req.query.select;
  }

  if (req.query.sort) {
    sortBy = req.query.sort;
  } else {
    sortBy = { "-createdAt": 1 };
  }
  const result = {};
  const model = req.model;

  const totalPosts = await model.countDocuments();
  let startIndex = (pageNumber - 1) * limit;
  result.totalPages = Math.ceil(totalPosts / limit);

  const extraStages = req.extraStages || [];
  console.log("extraStages", extraStages);

  console.log("filters", filters);

  // if (filters["name"]) {
  //   const categoryNameArray = filters["name"].split(",");
  //   extraStages.push({
  //     $lookup: {
  //       from: "categories",
  //       localField: "category",
  //       foreignField: "_id",
  //       as: "category",
  //     },
  //   });
  //   extraStages.push({
  //     $match: {
  //       "category.name": { $in: categoryNameArray },
  //     },
  //   });
  //   delete filters["name"];
  // }

  const params = [
    ...extraStages,
    {
      $match: filters,
    },
    {
      $project: selected,
    },
    {
      $sort: sortBy,
    },
    {
      $skip: startIndex,
    },
    {
      $limit: limit,
    },
  ];

  console.log("Aggregation pipeline:", params);

  result.data = await model.aggregate(params);

  result.limit = limit;
  result.currentPage = pageNumber;

  res.json({ success: true, result: result });
});

function isObjectIdValid(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    if (String(mongoose.Types.ObjectId(id)) === id) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function recursiveCasting(val) {
  if (typeof val === "object") {
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        val[i] = recursiveCasting(val[i]);
      }
    } else {
      for (key in val) {
        val[key] = recursiveCasting(val[key]);
      }
    }
  } else if (typeof val === "string") {
    if (isObjectIdValid(val)) {
      return mongoose.Types.ObjectId(val);
    } else {
      return val;
    }
  } else {
    return val;
  }
  return val;
}
