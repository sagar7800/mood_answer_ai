const mongoose = require("mongoose");
const passportLocalMongooseModule = require("passport-local-mongoose");

const passportLocalMongoose =
  passportLocalMongooseModule.default || passportLocalMongooseModule;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true },
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: "username",
  usernameLowerCase: true,
  usernameQueryFields: ["email"],
  hashField: "passwordHash",
  saltField: "passwordSalt",
  errorMessages: {
    IncorrectPasswordError: "Username or password is wrong.",
    IncorrectUsernameError: "Username or password is wrong.",
  },
});

module.exports = mongoose.model("User", userSchema);
