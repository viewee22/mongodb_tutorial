// 비동기적으로 백엔드에서 호출을 할 예정
// 그러려면 axios 라는 모듈이 필요
console.log("client code running!!");

const axios = require("axios");
const URI = "http://localhost:3000";

const test = async () => {
  let {
    data: { blogs },
  } = await axios.get(`${URI}/blog`);
  blogs = await Promise.all(
    blogs.map(async (blog) => {
      const res1 = await axios.get(`${URI}/user/${blog.user}`);
      const res2 = await axios.get(`${URI}/blog/${blog._id}/comment`);
      blog.user = res1.data.user;
      blog.comments = res2.data.comments;
      return blog;
    })
  );

  console.log(blogs[0]);
};

test();
