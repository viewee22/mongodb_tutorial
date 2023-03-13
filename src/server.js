const express = require("express");
const app = express();
const { userRouter } = require("./routes/userRoute");
const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb+srv://viewee22:m4n79CiFXqPr@mongodbtutorial.myskbzf.mongodb.net/BlogService?retryWrites=true&w=majority";

const server = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    mongoose.set("debug", true);
    console.log("Mongodb Connected!");
    app.use(express.json());

    app.use("/user", userRouter);

    app.listen(3000, () => console.log("server listening on port 3000"));
  } catch (error) {
    console.log(error);
  }
};

server();
