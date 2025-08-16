const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET all houses or filter by city
app.get('/houses', async (req, res) => {
  const { city } = req.query;
  let query = supabase.from('houses').select('*');
  if (city) query = query.eq('city', city);

  const { data, error } = await query;

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// POST a new house
app.post('/houses', async (req, res) => {
  const { data, error } = await supabase.from('houses').insert([req.body]);
  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
