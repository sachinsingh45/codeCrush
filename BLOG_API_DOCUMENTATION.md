# CodeCrush Blog API Documentation

This document outlines all the blog-related API endpoints for the CodeCrush platform, which allows developers to create, share, and interact with blog posts similar to LinkedIn.

## Base URL
```
http://localhost:7777
```

## Authentication
Most endpoints require authentication. Include the JWT token in the request headers:
```
Authorization: Bearer <your-jwt-token>
```

## Blog Endpoints

### 1. Create a Blog Post
**POST** `/blogs`

Create a new blog post.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my blog post...",
  "tags": ["javascript", "react", "web-development"],
  "status": "published",
  "featuredImage": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "data": {
    "_id": "blog_id",
    "title": "My First Blog Post",
    "content": "This is the content of my blog post...",
    "author": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "photoUrl": "https://robohash.org/John Doe?set=set1"
    },
    "tags": ["javascript", "react", "web-development"],
    "status": "published",
    "readTime": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All Blogs
**GET** `/blogs`

Get all published blogs with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of blogs per page (default: 10)
- `tags` (optional): Comma-separated tags to filter by
- `author` (optional): Author ID to filter by
- `search` (optional): Search term for title or content

**Example:**
```
GET /blogs?page=1&limit=5&tags=javascript,react&search=web development
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "blog_id",
      "title": "Blog Title",
      "content": "Blog content...",
      "author": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "photoUrl": "https://robohash.org/John Doe?set=set1"
      },
      "tags": ["javascript", "react"],
      "likeCount": 5,
      "commentCount": 3,
      "shareCount": 2,
      "readTime": 3,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalBlogs": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Get Blog by ID
**GET** `/blogs/:id`

Get a specific blog post with all details including likes, comments, and shares.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "blog_id",
    "title": "Blog Title",
    "content": "Blog content...",
    "author": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "photoUrl": "https://robohash.org/John Doe?set=set1",
      "about": "Developer bio",
      "skills": ["JavaScript", "React", "Node.js"]
    },
    "tags": ["javascript", "react"],
    "likes": [
      {
        "user": {
          "_id": "user_id",
          "firstName": "Jane",
          "lastName": "Smith",
          "photoUrl": "https://robohash.org/Jane Smith?set=set1"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "comments": [
      {
        "_id": "comment_id",
        "user": {
          "_id": "user_id",
          "firstName": "Jane",
          "lastName": "Smith",
          "photoUrl": "https://robohash.org/Jane Smith?set=set1"
        },
        "content": "Great post!",
        "likes": [],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "shares": [
      {
        "user": {
          "_id": "user_id",
          "firstName": "Bob",
          "lastName": "Johnson",
          "photoUrl": "https://robohash.org/Bob Johnson?set=set1"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "likeCount": 1,
    "commentCount": 1,
    "shareCount": 1,
    "readTime": 3,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Blog Post
**PUT** `/blogs/:id`

Update a blog post (only by the author).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Blog Title",
  "content": "Updated content...",
  "tags": ["javascript", "react", "nodejs"],
  "status": "published",
  "featuredImage": "https://example.com/new-image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog post updated successfully",
  "data": {
    "_id": "blog_id",
    "title": "Updated Blog Title",
    "content": "Updated content...",
    "author": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "photoUrl": "https://robohash.org/John Doe?set=set1"
    },
    "tags": ["javascript", "react", "nodejs"],
    "status": "published",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Delete Blog Post
**DELETE** `/blogs/:id`

Delete a blog post (only by the author).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Blog post deleted successfully"
}
```

### 6. Like/Unlike Blog Post
**POST** `/blogs/:id/like`

Like or unlike a blog post.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Like):**
```json
{
  "success": true,
  "message": "Blog post liked successfully",
  "liked": true,
  "likeCount": 6
}
```

**Response (Unlike):**
```json
{
  "success": true,
  "message": "Blog post unliked successfully",
  "liked": false,
  "likeCount": 5
}
```

### 7. Add Comment
**POST** `/blogs/:id/comments`

Add a comment to a blog post.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "This is a great blog post!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "comment_id",
    "user": {
      "_id": "user_id",
      "firstName": "Jane",
      "lastName": "Smith",
      "photoUrl": "https://robohash.org/Jane Smith?set=set1"
    },
    "content": "This is a great blog post!",
    "likes": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 8. Like/Unlike Comment
**POST** `/blogs/:blogId/comments/:commentId/like`

Like or unlike a comment.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Comment liked successfully",
  "liked": true,
  "likeCount": 2
}
```

### 9. Delete Comment
**DELETE** `/blogs/:blogId/comments/:commentId`

Delete a comment (only by comment author or blog author).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

### 10. Share Blog Post
**POST** `/blogs/:id/share`

Share a blog post.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Blog post shared successfully",
  "shareCount": 3
}
```

### 11. Get User's Blogs
**GET** `/users/:userId/blogs`

Get all published blogs by a specific user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of blogs per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "blog_id",
      "title": "User's Blog",
      "content": "Blog content...",
      "author": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "photoUrl": "https://robohash.org/John Doe?set=set1"
      },
      "tags": ["javascript"],
      "likeCount": 5,
      "commentCount": 2,
      "shareCount": 1,
      "readTime": 3,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalBlogs": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 12. Get Trending Blogs
**GET** `/blogs/trending`

Get trending blogs based on engagement (likes, comments, shares).

**Query Parameters:**
- `limit` (optional): Number of blogs to return (default: 10)
- `days` (optional): Number of days to look back (default: 7)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "blog_id",
      "title": "Trending Blog",
      "content": "Blog content...",
      "author": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "photoUrl": "https://robohash.org/John Doe?set=set1"
      },
      "engagementScore": 25,
      "likeCount": 10,
      "commentCount": 5,
      "shareCount": 2,
      "readTime": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 13. Get User Blog Statistics
**GET** `/users/:userId/blog-stats`

Get blog statistics for a specific user.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBlogs": 15,
    "totalLikes": 150,
    "totalComments": 75,
    "totalShares": 30,
    "publishedBlogs": 12,
    "draftBlogs": 3
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Blog Post Schema

```javascript
{
  title: String (10-200 chars, required),
  content: String (50-10000 chars, required),
  author: ObjectId (ref: User, required),
  tags: [String] (max 10 tags),
  likes: [{ user: ObjectId, createdAt: Date }],
  comments: [{
    user: ObjectId,
    content: String (1-1000 chars),
    likes: [{ user: ObjectId, createdAt: Date }],
    createdAt: Date
  }],
  shares: [{ user: ObjectId, createdAt: Date }],
  status: String (enum: "draft", "published", "archived"),
  readTime: Number (calculated automatically),
  featuredImage: String (optional URL),
  createdAt: Date,
  updatedAt: Date
}
```

## Features Included

✅ **Blog CRUD Operations**
- Create, read, update, delete blog posts
- Draft and published status support
- Featured image support

✅ **Social Interactions**
- Like/unlike blog posts
- Add comments with nested likes
- Share blog posts
- Delete comments (author or blog owner)

✅ **Search and Filtering**
- Search by title and content
- Filter by tags
- Filter by author
- Pagination support

✅ **Analytics and Insights**
- Trending blogs based on engagement
- User blog statistics
- Read time calculation
- Engagement scoring

✅ **User Experience**
- Populated author information
- Virtual fields for counts
- Comprehensive error handling
- Proper validation

This blog system provides a complete LinkedIn-style experience for developers to share their knowledge and engage with the community! 