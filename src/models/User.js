const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: {
      first: { type: String, required: true },
      last: { type: String, required: true },
    },
    age: Number,
    email: String,
  },
  { timestamps: true }
);

// user 라는 콜렉션에, UserSchema 형태로 데이터를 만들거야. 라고 mongoose 에 알려주기
const User = model("user", UserSchema);
module.exports = { User };
