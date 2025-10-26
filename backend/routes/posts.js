const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const authenticateJWT = require('../middleware/auth');
// Get all posts (public)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username').sort({createdAt: -1});
    res.json(posts);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get post by ID (public)
router.get('/:id', async (req,res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if(!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
} catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Create new post (authenticated)
router.post('/', authenticateJWT, 
  body('title').isLength({ min: 1, max: 100 }),
  body('content').isLength({ min: 1 }),
  async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, content } = req.body;
      const post = new Post({
        author: req.user.id,
        title,
        content
      });
      await post.save();
      res.status(201).json(post);
    } catch(err){
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);
// Update post (authenticated & author only)
router.put('/:id', authenticateJWT, 
  body('title').optional().isLength({ min: 1, max: 100 }),
  body('content').optional().isLength({ min: 1 }),
  async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.id);
      if(!post) return res.status(404).json({ message: 'Post not found' });
      if(post.author.toString() !== req.user.id){
        return res.status(403).json({ message: 'Forbidden' });
      }
      if(req.body.title) post.title = req.body.title;
      if(req.body.content) post.content = req.body.content;if(req.body.content) post.content = req.body.content;
      post.updatedAt = Date.now();
      await post.save();
      res.json(post);
    } catch(err){
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);
// Delete post (authenticated & author only)
router.delete('/:id', authenticateJWT, async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ message: 'Post not found' });
    if(post.author.toString() !== req.user.id){
      return res.status(403).json({ message: 'Forbidden' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
