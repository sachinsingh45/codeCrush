const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const codeSnippetSchema = new Schema({
  code: { type: String, required: true },
  description: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'SnippetReview' }],
  aiSummary: { type: String },
  aiSummaryGenerated: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tags: { type: [String], default: [] },
  language: { type: String, default: 'javascript' }
});

module.exports = mongoose.model('CodeSnippet', codeSnippetSchema); 