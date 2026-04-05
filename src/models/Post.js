import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [500, 'Content cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);

export default Post;