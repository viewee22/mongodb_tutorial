const { Router } = require("express");
const userRouter = Router();
const mongoose = require("mongoose");
const { User, Blog, Comment } = require("../models");

userRouter.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    return res.send({ users: users });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRouter.post("/", async (req, res) => {
  try {
    let { username, name } = req.body;
    if (!username)
      return res.status(400).send({ error: "username is required" });
    if (!name || !name.first || !name.last)
      return res
        .status(400)
        .send({ error: "Both first and last names are required " });

    const user = new User(req.body);
    await user.save();
    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ err: "invalid userId" });
    const user = await User.findOne({ _id: userId });
    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRouter.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ err: "invalid userId" });
    const [user] = await Promise.all([
      // 유저 삭제
      User.findOneAndDelete({ _id: userId }),
      // 해당 유저의 블로그 글들 삭제
      Blog.deleteMany({ "user._id": userId }),
      // 각 블로그 마다의에 해당 유저의 코멘트 제거
      Blog.updateMany(
        { "comments.user": userId },
        { $pull: { comments: { user: userId } } }
      ),
      // 유저가 작성한 코멘트 삭제
      Comment.deleteMany({ user: userId }),
    ]);

    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRouter.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ err: "invalid userId" });
    const { age, name } = req.body;
    if (!age && !name)
      return res.status(400).send({ error: "age or name is required" });
    if (age && typeof age !== "number")
      return res.status(400).send({ err: "age must be a number" });
    if (name && typeof name.first !== "string" && typeof name.last !== "string")
      return res
        .status(400)
        .send({ err: "first and last name must be a string" });

    // 1. mongoDB에서 처리
    // const user = await User.findByIdAndUpdate(
    //   userId,
    //   { age, name },
    //   { new: true }
    // );

    // 2.서버에서 mongoose를 통해 확인후 처리하는 방식
    let user = await User.findById(userId);
    if (age) user.age = age;
    if (name) {
      user.name = name;
      await Promise.all([
        await Blog.updateMany({ "user._id": userId }, { "user.name": name }),
        await Blog.updateMany(
          {},
          { "comments.$[comment].userFullName": `${name.first} ${name.last}` },
          { arrayFilters: [{ "comment.user": userId }] }
        ),
      ]);
    }
    await user.save();

    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

module.exports = { userRouter };
