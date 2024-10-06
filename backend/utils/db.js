import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`Mongo DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("error connecting to mongo db");
    process.exit(1);
  }
};
