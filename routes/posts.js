const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Current code
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const post = new Post({
      user: req.user.id,
      content,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });
    await post.save();
    const populatedPost = await Post.findById(post._id).populate('user', 'username');
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('user', 'username') // Ensure this populates correctly
      .populate('comments.user', 'username') // Also populate comment users
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();
    
    // Debug log to verify data
    console.log('Posts fetched:', posts.map(p => ({
      id: p._id,
      user: p.user,
      content: p.content
    })));

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if already liked
    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(req.user.id);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user.id,
      text
    };

    post.comments.push(comment);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;