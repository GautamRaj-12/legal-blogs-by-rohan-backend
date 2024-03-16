import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/connection.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERR: ", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo DB connection FAILED!!!!", err);
  });
