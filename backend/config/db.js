import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongodb connected!");
  } catch (error) {
    console.error("Error cinnecting to Mongodb", error);
    process.exit(1);
  }
};
