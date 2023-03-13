const { Router } = require("express");
const blogRouter = Router();
const { Blog } = require("../models/Blog");
const { User } = require("../models/User");
const { isValidObjectId } = require("mongoose");

blogRouter.post("/", async (req, res) => {
  try {
    const { title, content, islive, userId } = req.body;
    if (typeof title !== "string")
      res.status(400).send({ err: "title is required" });
    if (typeof content !== "string")
      res.status(400).send({ err: "content is required" });
    if (islive && islive !== "boolean")
      res.status(400).send({ err: "islive must be a boolean" });
    if (!isValidObjectId(userId))
      res.status(400).send({ err: "userId is invaild" });
    // 유저가 데이터베이스에 존재하는지 확인
    let user = await User.findById(userId);
    if (!user) res.status(400).send({ err: "user does not exist" });

    let blog = new Blog({ ...req.body, user });
    await blog.save();
    return res.send({ blog });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

blogRouter.get("/", async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});
blogRouter.get("/:blogId", async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});
blogRouter.put("/:blogId", async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

// patch 는 부분적으로 수정할 때 사용
blogRouter.patch("/:blogId/live", async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

module.exports = { blogRouter };
