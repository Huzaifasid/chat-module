import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../config.env" });
const DB =
  "mongodb+srv://huzaifa:UnadEVKxg6Ie8334@practice.vqcazfv.mongodb.net/chatmodule";
// console.log(DB);
mongoose
  .connect(`${DB}`)
  .then(() => {
    console.log("Data base Connected");
  })
  .catch(() => {
    console.log("Data base not Connected");
  });
