const { Router } = require("express");
const commentRouter = Router({ mergeParams: true });
const { Blog, User, Comment } = require("../models");
const { isValidObjectId } = require("mongoose");

commentRouter.post("/", async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, userId } = req.body;
    if (!isValidObjectId(blogId))
      return res.status(400).send({ error: "blogId is invalid" });
    if (!isValidObjectId(userId))
      return res.status(400).send({ error: "userId is invalid" });
    if (typeof content !== "string")
      return res.status(400).send({ error: "content is required" });

    const [blog, user] = await Promise.all([
      Blog.findById(blogId),
      User.findById(userId),
    ]);

    if (!blog || !user)
      return res.status(400).send({ error: "blog or user not exist" });
    if (!blog.islive)
      return res.status(400).send({ error: "blog is not available" });

    const comment = new Comment({
      content,
      user,
      userFullName: `${user.name.first} ${user.name.last}`,
      blog: blogId,
    });
    // await Promise.all([
    //   comment.save(),
    //   Blog.updateOne({ _id: blogId }, { $push: { comments: comment } }),
    // ]);

    blog.commentsCount++;
    blog.comments.push(comment);
    // 첫번째 객체가 날라감
    if (blog.commentsCount > 3) blog.comments.shift();

    await Promise.all([
      comment.save(),
      blog.save(),
      // Blog.updateOne({ _id: blogId }, { $inc: { commentsCount: 1 } }),
    ]);

    return res.send({ comment });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

commentRouter.get("/", async (req, res) => {
  let { page = 0 } = req.query;
  page = parseInt(page);

  const { blogId } = req.params;
  if (!isValidObjectId(blogId))
    return res.status(400).send({ err: "blogId is invalid" });

  const comments = await Comment.find({ blog: blogId })
    .sort({ createdAt: -1 })
    .skip(page * 3)
    .limit(3);
  return res.send({ comments });
});

commentRouter.patch("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (typeof content !== "string")
    return res.status(400).send({ err: "content is required" });

  const [comment] = await Promise.all([
    Comment.findByIdAndUpdate({ _id: commentId }, { content }, { new: true }),
    Blog.updateOne(
      { "comments._id": commentId },
      { "comments.$.content": content }
    ),
  ]);

  return res.send({ comment });
});

commentRouter.delete("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findOneAndDelete({ _id: commentId });
  await Blog.updateOne(
    { "comments._id": commentId },
    { $pull: { comments: { _id: commentId } } }
  );

  return res.send({ comment });
});
module.exports = { commentRouter };
