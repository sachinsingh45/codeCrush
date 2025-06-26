const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const snippetReviewSchema = new Schema({
  snippet: { type: Schema.Types.ObjectId, ref: 'CodeSnippet', required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  review: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  xpAwarded: { type: Number, default: 0 }
});

module.exports = mongoose.model('SnippetReview', snippetReviewSchema); 