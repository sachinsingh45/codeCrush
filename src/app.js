const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

require("dotenv").config();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",          
  "https://code-crush-frontend-psi.vercel.app", 
  "https://code-crush-frontend-git-main-sachin-singhs-projects-a8578191.vercel.app",
  "https://code-crush-frontend-i990ukqz7-sachin-singhs-projects-a8578191.vercel.app"     
];

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // 24 hours
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket health check endpoint
app.get('/socket-health', (req, res) => {
  res.json({ 
    status: 'Socket server is running',
    timestamp: new Date().toISOString(),
    cors: {
      origins: [
        "http://localhost:5173",
        "https://code-crush-frontend-psi.vercel.app", 
        "https://code-crush-frontend-git-main-sachin-singhs-projects-a8578191.vercel.app",
        "https://code-crush-frontend-i990ukqz7-sachin-singhs-projects-a8578191.vercel.app"
      ]
    }
  });
});

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");
const codeReviewRouter = require("./routes/codeReview");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", blogRouter);
app.use("/", chatRouter);
app.use("/code-review", codeReviewRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("Database connection established...");
    }
    server.listen(process.env.PORT, () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Server is successfully listening on port ${process.env.PORT}...`);
      }
    });
  })
  .catch((err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Database cannot be connected!");
    }
    process.exit(1);
  });

// Global error handler
app.use((err, req, res, next) => {
  // console.error('Error:', err.message);
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? "An unexpected error occurred. Please try again." 
    : err.message;
    
  res.status(500).json({ message });
});