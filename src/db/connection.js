import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    // console.log(connectionInstance);
    console.log(`DB connected to host ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("Mongo db connection failed!!!!!", error);
    process.exit(1);
  }
};
export default connectDB;
