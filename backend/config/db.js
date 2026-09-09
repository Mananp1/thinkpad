import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongodb connected!");
  } catch (error) {
    console.error("Error connecting to Mongodb", error);
    process.exit(1);
  }
};
