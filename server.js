// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Recipe = require('./models/Recipe.js');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/recipes_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.get('/api/recipes', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Recipe.countDocuments();
  const data = await Recipe.find().sort({ rating: -1 }).skip(skip).limit(limit);
  res.json({ page, limit, total, data });
});

app.get('/api/recipes/search', async (req, res) => {
  const query = {};
  const { calories, title, cuisine, total_time, rating } = req.query;

  if (title) query.title = { $regex: title, $options: 'i' };
  if (cuisine) query.cuisine = cuisine;
  if (total_time) query.total_time = { $lte: parseInt(total_time) };
  if (rating) query.rating = { $gte: parseFloat(rating) };
  if (calories) {
    const match = calories.match(/(<=|>=|=|<|>)(\d+)/);
    if (match) {
      const operatorMap = { '<=': '$lte', '>=': '$gte', '=': '$eq', '>': '$gt', '<': '$lt' };
      const operator = operatorMap[match[1]];
      const value = parseInt(match[2]);
      query['nutrients.calories'] = { [operator]: value };
    }
  }

  const data = await Recipe.find(query);
  res.json({ data });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
