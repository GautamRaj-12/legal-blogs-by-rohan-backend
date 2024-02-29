import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/connection.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb Connection failed", error);
  });
