require('dotenv').config(); // Load env vars
const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const cors = require('cors');
const Url = require('./models/url');

const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Connection failed:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Root route
app.get('/', (req, res) => {
  res.send('URL Shortener Backend is Live');
});

// POST /api/shorten
app.post('/api/shorten', async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const shortId = nanoid(6);
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  const shortUrl = `${baseUrl}/${shortId}`;

  try {
    const newEntry = new Url({ shortId, longUrl });
    await newEntry.save();
    res.json({ shortUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save URL' });
  }
});

// GET /:shortId
app.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const entry = await Url.findOne({ shortId });
    if (!entry) return res.status(404).send('Link not found');
    res.redirect(entry.longUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start server (only once)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
