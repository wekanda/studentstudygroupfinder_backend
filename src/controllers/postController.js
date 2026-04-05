import Post from '../models/Post.js';
import StudyGroup from '../models/StudyGroup.js';

export const getGroupPosts = async (req, res) => {
  try {
    const posts = await Post.find({ groupId: req.params.groupId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.includes(req.user._id) || group.leader.toString() === req.user._id.toString();
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to post in this group' });
    }

    const post = await Post.create({
      groupId: req.params.groupId,
      author: req.user._id,
      content: req.body.content
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const group = await StudyGroup.findById(post.groupId);

    if (post.author.toString() !== req.user._id.toString() && 
        group.leader.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};