const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const cors = require('cors');
const Url = require('./models/url');

const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB connection
mongoose.connect('mongodb+srv://praveen:qwer@cluster.c3utu6y.mongodb.net/url-shortener?retryWrites=true&w=majority&appName=Cluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Root route to confirm server is live
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
  const baseUrl = 'https://url-shortener-backend-t3bb.onrender.com'; // <-- updated here
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
