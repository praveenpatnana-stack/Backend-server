const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  shortId: String,
  longUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expireAt: Date // optional expiry
});

UrlSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', UrlSchema);
