// backend/import_recipes.js
const fs = require('fs');
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe.js');

async function importData() {
  const data = JSON.parse(fs.readFileSync('US_recipes.json'));
  Object.values(data).forEach(recipe => {
    recipe.rating = isNaN(recipe.rating) ? null : recipe.rating;
    recipe.prep_time = isNaN(recipe.prep_time) ? null : recipe.prep_time;
    recipe.cook_time = isNaN(recipe.cook_time) ? null : recipe.cook_time;
    recipe.total_time = isNaN(recipe.total_time) ? null : recipe.total_time;
  });

  await mongoose.connect('mongodb://localhost:27017/recipes_db');
  await Recipe.deleteMany({});
  await Recipe.insertMany(Object.values(data));
  console.log('Data imported!');
  mongoose.connection.close();
}

importData();
