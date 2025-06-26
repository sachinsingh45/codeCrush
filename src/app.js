const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

require("dotenv").config();
app.use(
  cors({
    origin: [
      "http://localhost:5173",          
      "https://code-crush-frontend-psi.vercel.app/", 
      "https://code-crush-frontend-git-main-sachin-singhs-projects-a8578191.vercel.app/",
      "https://code-crush-frontend-i990ukqz7-sachin-singhs-projects-a8578191.vercel.app/"     
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

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
    console.log("Database connection established...");
    server.listen(process.env.PORT, () => {
      console.log(`Server is successfully listening on port ${process.env.PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "An unexpected error occurred. Please try again." });
});