import CommentModel from "../Models/commentModel.js";
import PostModel from "../Models/postModel.js";

// Add a comment to a post
export const addComment = async (req, res) => {
  const { postId, userId, text } = req.body;

  try {
    // Ensure the post exists
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Create the comment
    const newComment = new CommentModel({ postId, userId, text });
    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const comment = await CommentModel.findById(id);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only the creator of the comment can delete it
    if (comment.userId !== userId) {
      return res.status(403).json({ message: "Action forbidden" });
    }

    await CommentModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
