const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");

const { MONGODB } = require("./config.js");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function main() {
  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGODB, { useNewUrlParser: true });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async ({ req }) => ({ req }),
  });

  console.log(`🚀  Server ready at: ${url}`);
}

main().catch((err) => console.log(err));
