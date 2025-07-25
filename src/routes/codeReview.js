const express = require('express');
const codeReviewRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const CodeSnippet = require('../models/codeSnippet');
const SnippetReview = require('../models/snippetReview');
const User = require('../models/user');
const { generateAISummary } = require('../utils/aiSummary');

// Submit a code snippet
codeReviewRouter.post('/snippet', userAuth, async (req, res) => {
  try {
    let { code, description, language, tags } = req.body;
    if (!language) language = 'javascript';
    if (!tags) tags = [];
    if (typeof tags === 'string') tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const snippet = new CodeSnippet({
      code,
      description,
      language,
      tags,
      author: req.user._id
    });
    await snippet.save();
    res.status(201).json({ message: 'Snippet submitted!', snippet });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add a review to a snippet
codeReviewRouter.post('/snippet/:id/review', userAuth, async (req, res) => {
  try {
    const { review } = req.body;
    const snippet = await CodeSnippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    const snippetReview = new SnippetReview({
      snippet: snippet._id,
      reviewer: req.user._id,
      review
    });
    await snippetReview.save();
    snippet.reviews.push(snippetReview._id);
    await snippet.save();
    res.status(201).json({ message: 'Review added!', snippetReview });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Upvote/un-upvote a review
codeReviewRouter.post('/review/:id/upvote', userAuth, async (req, res) => {
  try {
    const review = await SnippetReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const userIdStr = req.user._id.toString();
    const alreadyUpvoted = review.upvotedBy.map(id => id.toString()).includes(userIdStr);
    let reviewer;
    if (alreadyUpvoted) {
      // Un-upvote
      review.upvotes = Math.max(0, review.upvotes - 1);
      review.upvotedBy = review.upvotedBy.filter(id => id.toString() !== userIdStr);
      await review.save();
      reviewer = await User.findByIdAndUpdate(review.reviewer, { $inc: { upvotesGained: -1 } }, { new: true });
      res.json({ message: 'Review un-upvoted!', review, upvoted: false });
    } else {
      // Upvote
      review.upvotes += 1;
      review.upvotedBy.push(req.user._id);
      await review.save();
      reviewer = await User.findByIdAndUpdate(review.reviewer, { $inc: { upvotesGained: 1 } }, { new: true });
      res.json({ message: 'Upvoted!', review, upvoted: true });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Upvote/un-upvote a code snippet
codeReviewRouter.post('/snippet/:id/upvote', userAuth, async (req, res) => {
  try {
    const snippet = await CodeSnippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    const userIdStr = req.user._id.toString();
    const alreadyUpvoted = snippet.upvotedBy.map(id => id.toString()).includes(userIdStr);
    let author;
    if (alreadyUpvoted) {
      // Un-upvote
      snippet.upvotes = Math.max(0, snippet.upvotes - 1);
      snippet.upvotedBy = snippet.upvotedBy.filter(id => id.toString() !== userIdStr);
      await snippet.save();
      author = await User.findByIdAndUpdate(snippet.author, { $inc: { upvotesGained: -1 } }, { new: true });
      res.json({ message: 'Snippet un-upvoted!', snippet, upvoted: false });
    } else {
      // Upvote
      snippet.upvotes += 1;
      snippet.upvotedBy.push(req.user._id);
      await snippet.save();
      author = await User.findByIdAndUpdate(snippet.author, { $inc: { upvotesGained: 1 } }, { new: true });
      res.json({ message: 'Snippet upvoted!', snippet, upvoted: true });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all code snippets (for list view, with sorting)
codeReviewRouter.get('/snippet/all', async (req, res) => {
  try {
    const { sort = 'recent' } = req.query;
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'top') sortOption = { upvotes: -1, createdAt: -1 };
    const snippets = await CodeSnippet.find()
      .sort(sortOption)
      .populate('author', 'firstName lastName photoUrl')
      .select('-reviews'); // Don't populate reviews for list
    res.json({ snippets });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get snippet details (with reviews, upvotes, summary)
codeReviewRouter.get('/snippet/:id', async (req, res) => {
  try {
    const snippet = await CodeSnippet.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: { path: 'reviewer', select: 'firstName lastName xp photoUrl' }
      })
      .populate('author', 'firstName lastName photoUrl');
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    res.json({ snippet });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// AI summary endpoint
codeReviewRouter.post('/snippet/:id/ai-summary', userAuth, async (req, res) => {
  try {
    const snippet = await CodeSnippet.findById(req.params.id).populate('reviews');
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    if (snippet.reviews.length < 3) {
      return res.status(400).json({ message: 'At least 3 reviews required for summary.' });
    }
    // Get top 3 reviews by upvotes
    const reviewsPopulated = await SnippetReview.find({ _id: { $in: snippet.reviews } });
    const topReviews = reviewsPopulated
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 3)
      .map(r => r.review);
    const summary = await generateAISummary(topReviews);
    // Do NOT save summary to snippet, just return it
    res.json({ summary });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit a code snippet (only by author)
codeReviewRouter.put('/snippet/:id', userAuth, async (req, res) => {
  try {
    const snippet = await CodeSnippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    if (snippet.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own snippets' });
    }
    const { code, description, tags, language } = req.body;
    if (code !== undefined) snippet.code = code;
    if (description !== undefined) snippet.description = description;
    if (tags !== undefined) snippet.tags = tags;
    if (language !== undefined) snippet.language = language;
    await snippet.save();
    res.json({ message: 'Snippet updated!', snippet });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = codeReviewRouter; 