import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/userModel.js";

// Create a new post
export const createPost = async (req, res) => {
  const newPost = new PostModel(req.body);

  try {
    await newPost.save();
    res.status(200).json("Post created!");
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get a single post by ID
export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Update a post by ID
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post updated");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete a post by ID
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("Post deleted successfully");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Like/Unlike a post
export const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post liked");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get all posts (new function)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ createdAt: -1 }); // Fetch all posts sorted by latest
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get timeline posts (posts from the user and the users they follow)
export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const currentUserPosts = await PostModel.find({ userId: userId }); // User's own posts
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);

    // Combine user's posts and following posts, then sort by creation date
    const allPosts = currentUserPosts.concat(
      ...(followingPosts[0]?.followingPosts || [])
    );
    allPosts.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(allPosts);
  } catch (error) {
    res.status(500).json(error);
  }
};
