const express = require("express");
const app = express();
const { userRouter, blogRouter } = require("./routes");
const mongoose = require("mongoose");
const { generateFakeData } = require("../faker2");

const server = async () => {
  try {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) throw new Error("MONGO_URI is required!!!");

    await mongoose.connect(MONGO_URI);
    // mongoose.set("debug", true);

    console.log("Mongodb Connected!");
    app.use(express.json());

    app.use("/user", userRouter);
    app.use("/blog", blogRouter);

    app.listen(3000, async () => {
      console.log("server listening on port 3000");
      // console.time("insert time: ");
      // await generateFakeData(10, 2, 20);
      // console.timeEnd("insert time: ");
    });
  } catch (error) {
    console.log(error);
  }
};

server();
