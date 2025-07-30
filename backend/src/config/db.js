import mongoose from "mongoose";
<<<<<<< HEAD

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
=======
import dotenv from "dotenv";

dotenv.config();
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
>>>>>>> 884855a (New Features)
    console.log("Mongodb connected!");
  } catch (error) {
    console.error("Error cinnecting to Mongodb", error);
    process.exit(1);
  }
};
