const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
// Register
router.post('/register',
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
      const existingUser = await User.findOne({ username });
      if(existingUser){
        return res.status(400).json({ message: 'Username already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch(err){
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);
// Login
router.post('/login',
  body('username').exists(),
  body('password').exists(),
  async (req,res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if(!user){
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const match = await bcrypt.compare(password, user.password);
      if(!match){
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch(err){
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);
module.exports = router;
