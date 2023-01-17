const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");
const { SECRET_KEY } = require("../../config");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Mutation: {
    async login(_, args) {
      const { username, password } = args;
      const { valid, errors } = validateLoginInput(username, password);

      if (!valid) {
        throw new GraphQLError("Validation Error", { extensions: { errors } });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "User not Found";
        throw new GraphQLError("user not found", { extensions: { errors } });
      }
      console.log(user);
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        throw new GraphQLError("Wrong Credentials", { extensions: { errors } });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(_, args) {
      const { username, email, password, confirmPassword } = args.registerInput;
      // TODO validate userdata
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new GraphQLError("validation error", { extensions: { errors } });
      }
      // TODO Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        errors.general = "username has been taken";
        throw new GraphQLError("username already exists", {
          extensions: { errors },
        });
      }
      // hash password and create an auth token

      const hashPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password: hashPassword,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
