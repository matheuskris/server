const { GraphQLError } = require("graphql");
const Post = require("../../models/post");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Mutation: {
    async createComment(_, { postId, body }, context) {
      const user = checkAuth(context);

      if (body.trim() === "") {
        throw new GraphQLError("Empty Comment", {
          errors: {
            body: "Comment body must not be empty",
          },
        });
      }

      const post = await Post.findById(postId);

      if (post) {
        post.comments.unshift({
          body,
          username: user.username,
          createdAt: new Date().toISOString(),
        });
        post.save();
        return post;
      } else {
        throw new GraphQLError("Post not found");
      }
    },
    async deleteComment(_, { postId, commentId }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (
          commentIndex !== -1 &&
          post.comments[commentIndex].username === username
        ) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new GraphQLError("Action not allowed");
        }
      } else {
        throw new GraphQLError("post not found");
      }
    },
    async likePost(_, { postId }, context) {
      const user = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        const postLikeIndex = post.likes.findIndex(
          (like) => like.username === user.username
        );
        if (postLikeIndex === -1) {
          post.likes.push({
            username: user.username,
            createdAt: new Date().toISOString(),
          });
        } else {
          post.likes.splice(postLikeIndex, 1);
        }
        post.save();
      } else {
        throw new GraphQLError("post not found");
      }
      return post;
    },
  },
};
