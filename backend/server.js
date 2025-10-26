const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb://localhost:27017/BLOG';
// Connect to MongoDB
mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
// Health check route
app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));