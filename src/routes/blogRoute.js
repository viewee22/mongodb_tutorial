const { Router } = require("express");
const blogRouter = Router();
const { Blog, User, Comment } = require("../models");
const { isValidObjectId } = require("mongoose");
const { commentRouter } = require("./commentRoute");

blogRouter.use("/:blogId/comment", commentRouter);

blogRouter.post("/", async (req, res) => {
  try {
    const { title, content, islive, userId } = req.body;
    if (typeof title !== "string")
      return res.status(400).send({ err: "title is required" });
    if (typeof content !== "string")
      return res.status(400).send({ err: "content is required" });
    if (islive && typeof islive !== "boolean")
      return res.status(400).send({ err: "islive must be a boolean" });
    if (!isValidObjectId(userId))
      return res.status(400).send({ err: "userId is invaild" });
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
    const blogs = await Blog.find({}).limit(200);
    // .populate([
    //   { path: "user" },
    //   { path: "comments", populate: { path: "user" } },
    // ]);
    return res.send({ blogs });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});
blogRouter.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId))
      res.status(400).send({ err: "blogId is invaild" });

    const blog = await Blog.findOne({ _id: blogId });
    // const commentCount = await Comment.find({ blog: blogId }).countDocuments();

    return res.send({ blog });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});
blogRouter.put("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId))
      res.status(400).send({ err: "blogId is invaild" });

    const { title, content } = req.body;
    if (typeof title !== "string")
      res.status(400).send({ err: "title is required" });
    if (typeof content !== "string")
      res.status(400).send({ err: "content is required" });

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId },
      { title, content },
      { new: true }
    );
    return res.send({ blog });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

// patch 는 부분적으로 수정할 때 사용
blogRouter.patch("/:blogId/live", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId))
      res.status(400).send({ err: "blogId is invaild" });

    const { islive } = req.body;
    if (typeof islive !== "boolean")
      res.status(400).send({ err: "boolean islive is required" });

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { islive },
      { new: true }
    );
    return res.send({ blog });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

module.exports = { blogRouter };
