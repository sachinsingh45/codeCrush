# CodeCrush - Backend

CodeCrush is a platform where coders and developers can **connect and communicate** in real-time. The frontend is built using **React.js**, powered by **Vite** for fast development, and styled with **Tailwind CSS**. The backend is built with **Node.js** and **Express**, using **MongoDB** for data storage and **Socket.io** for real-time interactions.

## Features 🚀

### 🔐 Authentication & User Management
- **JWT-based Authentication** with secure token management
- **User Registration & Login** with email validation
- **Profile Management** with customizable user information
- **Profile Pictures** using RoboHash API for unique avatars
- **User Skills & About** sections for professional networking

### 💬 Real-time Communication
- **Socket.io-powered Chat** for instant messaging
- **Private Chat Rooms** with secure room generation
- **Message Persistence** in MongoDB for chat history
- **Chat with Connections** - only connected users can chat
- **Message Timestamps** and sender information

### 👥 Social Networking
- **Connection System** - send and receive connection requests
- **User Discovery** - find new developers to connect with
- **Connection Status** tracking (pending, connected, none)
- **User Feed** - discover developers not yet connected
- **Public User Profiles** with detailed information
- **Connection Management** - view all your connections

### 📝 Blog Platform
- **Blog Creation** with title, content, and tags
- **Blog Publishing System** with draft/published status
- **Tag-based Categorization** for easy discovery
- **Blog Search & Filtering** by tags, author, and content
- **Blog Interactions** - like, comment, and share functionality
- **Nested Comments** with like system
- **Read Time Calculation** for better user experience
- **Featured Images** support for blog posts
- **Blog Analytics** - view counts, engagement metrics

### 🔍 Code Review System
- **Code Snippet Submission** with language detection
- **Peer Code Review** system for collaborative learning
- **Review Upvoting** to highlight quality feedback
- **AI-Powered Summaries** of top reviews (requires 3+ reviews)
- **Code Highlighting** with syntax highlighting
- **Review Statistics** and user performance tracking
- **Code Snippet Management** - edit and update submissions

### 🏆 Gamification & Analytics
- **Leaderboard System** based on upvotes gained
- **Review Statistics** - total reviews, upvotes, snippets reviewed
- **User Performance Tracking** across all features

## Tech Stack 🛠️

### Backend:
- **Node.js** (Runtime environment)
- **Express.js** (Backend framework)
- **MongoDB** (Database)
- **Mongoose** (ODM for MongoDB)
- **JWT (jsonwebtoken)** (Authentication)
- **Socket.io** (Real-time WebSockets)
- **bcrypt** (Password hashing)
- **dotenv** (Environment variables management)
- **cookie-parser & CORS** (Middleware for security & access control)
- **AWS SES** (Email services)
- **node-cron** (Scheduled tasks)
- **date-fns** (Date manipulation)
- **validator** (Input validation)

### Frontend: [CodeCrush-frontend](https://github.com/sachinsingh45/codeCrush-frontend)
- **React.js** (v19)
- **Vite** (Fast development server)
- **Tailwind CSS** & **DaisyUI** (For UI styling)
- **React Router** (For navigation)
- **Redux Toolkit** (For state management)
- **Framer Motion** (For animations)
- **Socket.io-client** (For real-time communication)
- **React Toastify** (For notifications)
- **React Markdown** (Markdown rendering)
- **Prism React Renderer** (Code syntax highlighting)
- **DOMPurify** (XSS protection)
- **React Icons** (Icon library)

## Database Models 📊

### User Model
- Personal information (name, email, age, gender)
- Professional details (about, skills, social links)
- Authentication data (password hash, tokens)
- Engagement metrics (upvotes gained)
- Connection and request tracking

### Blog Model
- Content (title, content, tags, status)
- Author information and timestamps
- Engagement data (likes, comments, shares)
- Analytics (read time, view count)
- Featured images and metadata

### Chat Model
- Participants (user IDs)
- Messages with sender and timestamp
- Real-time message handling

### ConnectionRequest Model
- Request details (from, to, status)
- Timestamp tracking
- Status management (pending, accepted, rejected)

### CodeSnippet Model
- Code content and language
- Author and description
- Tags and metadata
- Review system integration
- Upvote tracking

### SnippetReview Model
- Review content and author
- Snippet reference
- Upvote system
- Quality metrics

## API Endpoints 🔌

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### User Management
- `GET /user/connections` - Get user connections
- `GET /user/requests/received` - Get pending requests
- `GET /feed` - Discover new users
- `GET /users/:id` - Get public user profile
- `GET /user/relationship/:id` - Check connection status
- `GET /leaderboard` - Get top users
- `GET /review-stats/:userId` - Get user review statistics

### Blog System
- `POST /blogs` - Create blog post
- `GET /blogs` - Get all blogs with pagination
- `GET /blogs/:id` - Get specific blog
- `PUT /blogs/:id` - Update blog post
- `DELETE /blogs/:id` - Delete blog post
- `POST /blogs/:id/like` - Like/unlike blog
- `POST /blogs/:id/comment` - Add comment
- `POST /blogs/:id/share` - Share blog

### Code Review
- `POST /code-review/snippet` - Submit code snippet
- `GET /code-review/snippet/all` - Get all snippets
- `GET /code-review/snippet/:id` - Get snippet details
- `PUT /code-review/snippet/:id` - Update snippet
- `POST /code-review/snippet/:id/review` - Add review
- `POST /code-review/snippet/:id/upvote` - Upvote snippet
- `POST /code-review/review/:id/upvote` - Upvote review
- `POST /code-review/snippet/:id/ai-summary` - Generate AI summary

### Chat System
- `GET /chat/:targetUserId` - Get chat history
- Socket events for real-time messaging

### Connection Management
- `POST /request/send` - Send connection request
- `POST /request/accept` - Accept connection request
- `POST /request/reject` - Reject connection request

## Installation & Setup 🛠️

### Backend Setup:
```bash
# Clone the backend repository
git clone https://github.com/sachinsingh45/codeCrush.git
cd codeCrush

# Install dependencies
npm install

# Create a .env file and configure your environment variables
PORT=7777
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region

# Start the backend server
npm run dev
```

### Frontend Setup:
```bash
# Clone the frontend repository
git clone https://github.com/sachinsingh45/codeCrush-frontend.git
cd codecrush-frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

## Environment Variables 🔧

### Backend (.env)
```env
PORT=7777
MONGODB_URI=mongodb://localhost:27017/codecrush
JWT_SECRET=your_super_secret_jwt_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:7777
```

## Features in Detail 📱

### Real-time Chat System
- **Secure Room Generation**: Uses SHA-256 hashing for private chat rooms
- **Message Persistence**: All messages stored in MongoDB
- **Connection Validation**: Only connected users can chat
- **Real-time Updates**: Instant message delivery via Socket.io
- **Chat History**: Persistent message history across sessions

### Blog Platform Features
- **Content Support**: Blog creation with title, content, and tags
- **Advanced Filtering**: Search by title, content, tags, and author
- **Pagination**: Efficient loading of large blog collections
- **Engagement Tracking**: Like, comment, and share functionality
- **Author Controls**: Full CRUD operations for blog authors
- **Public/Private**: Draft and published status management

### Code Review System
- **Multi-language Support**: Automatic language detection
- **Quality Metrics**: Upvote-based review quality system
- **AI Integration**: Automated summary generation for top reviews
- **Peer Learning**: Collaborative code improvement platform
- **Performance Tracking**: User statistics and leaderboards

### Social Networking
- **Smart Discovery**: Intelligent user recommendation system
- **Connection Management**: Comprehensive request handling
- **Profile Customization**: Rich user profiles with skills and bio
- **Professional Networking**: LinkedIn-style connection features

## Security Features 🔒

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt
- **CORS Configuration** for secure cross-origin requests
- **Input Validation** with comprehensive sanitization
- **XSS Protection** using DOMPurify
- **Secure Headers** implementation
- **Environment Variable** protection

## Performance Optimizations 🎯

- **Database Indexing** for fast queries
- **Pagination** for large data sets
- **Socket.io Optimization** for real-time features
- **Redux State Management** for efficient data flow

## Future Enhancements 🔥
- **1v1 Coding Battles** 🏆 (Mini LeetCode-style real-time challenges)
- **Code Collaboration (Live Coding Editor)**
- **AI-based code suggestions**
- **Leaderboard & Ranking System**
- **Spectator Mode for Code Battles**

## Contributing 🤝
We welcome contributions! Feel free to fork the repository and submit a pull request.

## License 📜
This project is licensed under the **MIT License**.

---
🚀 Built with ❤️ by **Sachin Singh & Team**

