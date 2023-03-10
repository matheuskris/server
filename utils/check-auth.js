const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

const { SECRET_KEY } = require("../config");

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new GraphQLError("Invalid/ExpiredToken");
      }
    }
    throw new Error('Authentication token must be "Bearer [token] ');
  }
  throw new Error("Authentication Header must be provided");
};
