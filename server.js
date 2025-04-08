require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

const app = express();

// Middleware - ONLY USE CORS ONCE!
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error!');
});
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));