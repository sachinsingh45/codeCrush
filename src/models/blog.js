const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Blog title is required"],
            trim: true,
            minlength: [10, "Blog title must be at least 10 characters long"],
            maxlength: [200, "Blog title cannot exceed 200 characters"],
        },
        content: {
            type: String,
            required: [true, "Blog content is required"],
            minlength: [50, "Blog content must be at least 50 characters long"],
            maxlength: [10000, "Blog content cannot exceed 10000 characters"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "Author is required"],
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: function (v) {
                    return v.length <= 10;
                },
                message: "Tags cannot exceed 10 entries",
            },
        },
        likes: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        comments: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            content: {
                type: String,
                required: [true, "Comment content is required"],
                trim: true,
                minlength: [1, "Comment cannot be empty"],
                maxlength: [1000, "Comment cannot exceed 1000 characters"],
            },
            likes: [{
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            }],
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        shares: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        status: {
            type: String,
            enum: {
                values: ["draft", "published"],
                message: "Status must be either 'draft' or 'published'",
            },
            default: "published",
        },
        readTime: {
            type: Number,
            default: function() {
                // Calculate read time based on content length (average reading speed: 200 words per minute)
                const wordCount = this.content.split(' ').length;
                return Math.ceil(wordCount / 200);
            },
        },
        featuredImage: {
            type: String,
            validate: {
                validator: function(v) {
                    if (!v) return true; // Allow empty
                    const urlRegex = /^https?:\/\/.+$/;
                    return urlRegex.test(v);
                },
                message: 'Featured image must be a valid URL',
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for better query performance
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ status: 1 });

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
    return this.comments.length;
});

// Virtual for share count
blogSchema.virtual('shareCount').get(function() {
    return this.shares.length;
});

// Ensure virtuals are serialized
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog; 