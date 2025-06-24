const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');
const mongoose = require('mongoose');

// Create a new blog post
router.post('/blogs', userAuth, async (req, res) => {
    try {
        const { title, content, tags, status, featuredImage } = req.body;

        const blog = new Blog({
            title,
            content,
            author: req.user._id,
            tags: tags || [],
            status: status || 'published',
            featuredImage,
        });

        await blog.save();

        // Populate author details
        await blog.populate('author', 'firstName lastName photoUrl');

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: blog,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// Get all published blogs with pagination and filtering
router.get('/blogs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { status: 'published' };

        // Filter by tags
        if (req.query.tags) {
            const tags = req.query.tags.split(',');
            filter.tags = { $in: tags };
        }

        // Filter by author
        if (req.query.author) {
            filter.author = req.query.author;
        }

        // Search by title or content
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { content: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        const blogs = await Blog.find(filter)
            .populate('author', 'firstName lastName photoUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments(filter);

        res.json({
            success: true,
            data: blogs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalBlogs: total,
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Get a specific blog by ID
router.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'firstName lastName photoUrl about skills')
            .populate('likes.user', 'firstName lastName photoUrl')
            .populate('comments.user', 'firstName lastName photoUrl')
            .populate('comments.likes.user', 'firstName lastName photoUrl')
            .populate('shares.user', 'firstName lastName photoUrl');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found',
            });
        }

        res.json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Update a blog post (only by author)
router.put('/blogs/:id', userAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found',
            });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own blog posts',
            });
        }

        const { title, content, tags, status, featuredImage } = req.body;

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                title,
                content,
                tags,
                status,
                featuredImage,
            },
            { new: true, runValidators: true }
        ).populate('author', 'firstName lastName photoUrl');

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            data: updatedBlog,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// Delete a blog post (only by author)
router.delete('/blogs/:id', userAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found',
            });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own blog posts',
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Blog post deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Like/Unlike a blog post
router.post('/blogs/:id/like', userAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found',
            });
        }

        const existingLike = blog.likes.find(
            (like) => like.user.toString() === req.user._id.toString()
        );

        if (existingLike) {
            // Unlike
            blog.likes = blog.likes.filter(
                (like) => like.user.toString() !== req.user._id.toString()
            );
            await blog.save();

            res.json({
                success: true,
                message: 'Blog post unliked successfully',
                liked: false,
                likeCount: blog.likes.length,
            });
        } else {
            // Like
            blog.likes.push({ user: req.user._id });
            await blog.save();

            res.json({
                success: true,
                message: 'Blog post liked successfully',
                liked: true,
                likeCount: blog.likes.length,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Add a comment to a blog post
router.post('/blogs/:id/comments', userAuth, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required',
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found',
            });
        }

        blog.comments.push({
            user: req.user._id,
            content: content.trim(),
        });

        await blog.save();

        // Populate the new comment with user details
        const newComment = blog.comments[blog.comments.length - 1];
        await blog.populate('comments.user', 'firstName lastName photoUrl');

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: newComment,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// Like/Unlike a comment
router.post('/blogs/:blogId/comments/:commentId/like', userAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found',
            });
        }

        const comment = blog.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
            });
        }

        const existingLike = comment.likes.find(
            (like) => like.user.toString() === req.user._id.toString()
        );

        if (existingLike) {
            // Unlike
            comment.likes = comment.likes.filter(
                (like) => like.user.toString() !== req.user._id.toString()
            );
        } else {
            // Like
            comment.likes.push({ user: req.user._id });
        }

        await blog.save();

        res.json({
            success: true,
            message: existingLike ? 'Comment unliked successfully' : 'Comment liked successfully',
            liked: !existingLike,
            likeCount: comment.likes.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Delete a comment (only by comment author or blog author)
router.delete('/blogs/:blogId/comments/:commentId', userAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found',
            });
        }

        const comment = blog.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
            });
        }

        // Check if user is the comment author or blog author
        const isCommentAuthor = comment.user.toString() === req.user._id.toString();
        const isBlogAuthor = blog.author.toString() === req.user._id.toString();

        if (!isCommentAuthor && !isBlogAuthor) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own comments or comments on your blog posts',
            });
        }

        comment.remove();
        await blog.save();

        res.json({
            success: true,
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Share a blog post
router.post('/blogs/:id/share', userAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found',
            });
        }

        const existingShare = blog.shares.find(
            (share) => share.user.toString() === req.user._id.toString()
        );

        if (existingShare) {
            return res.status(400).json({
                success: false,
                message: 'You have already shared this blog post',
            });
        }

        blog.shares.push({ user: req.user._id });
        await blog.save();

        res.json({
            success: true,
            message: 'Blog post shared successfully',
            shareCount: blog.shares.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Get user's blog posts
router.get('/users/:userId/blogs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let filter = { author: req.params.userId };
        const status = req.query.status;
        if (!status || status === 'published') {
            filter.status = 'published';
        } else if (status === 'draft') {
            filter.status = 'draft';
        } // if status === 'all', do not filter by status

        const blogs = await Blog.find(filter)
            .populate('author', 'firstName lastName photoUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments(filter);

        res.json({
            success: true,
            data: blogs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalBlogs: total,
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Get trending blogs (most liked and shared)
router.get('/blogs/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const days = parseInt(req.query.days) || 7;

        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - days);

        const blogs = await Blog.aggregate([
            {
                $match: {
                    status: 'published',
                    createdAt: { $gte: dateFilter }
                }
            },
            {
                $addFields: {
                    engagementScore: {
                        $add: [
                            { $size: '$likes' },
                            { $multiply: [{ $size: '$comments' }, 2] },
                            { $multiply: [{ $size: '$shares' }, 3] }
                        ]
                    }
                }
            },
            {
                $sort: { engagementScore: -1 }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: '$author'
            },
            {
                $project: {
                    'author.password': 0,
                    'author.__v': 0
                }
            }
        ]);

        res.json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Get blog statistics for a user
router.get('/users/:userId/blog-stats', async (req, res) => {
    try {
        const stats = await Blog.aggregate([
            {
                $match: { author: new mongoose.Types.ObjectId(req.params.userId) }
            },
            {
                $group: {
                    _id: null,
                    totalBlogs: { $sum: 1 },
                    totalLikes: { $sum: { $size: '$likes' } },
                    totalComments: { $sum: { $size: '$comments' } },
                    totalShares: { $sum: { $size: '$shares' } },
                    publishedBlogs: {
                        $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                    },
                    draftBlogs: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: stats[0] || {
                totalBlogs: 0,
                totalLikes: 0,
                totalComments: 0,
                totalShares: 0,
                publishedBlogs: 0,
                draftBlogs: 0
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router; 