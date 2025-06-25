const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Define allowed origins (only protocol, host, and port matter)
const allowedOrigins = [
  "https://courseui.vercel.app",
  "https://www.germanacademy.co.uk",
  "http://localhost:5173",
  "https://course-app-six-bay.vercel.app/login"  
];

// Middleware to parse JSON bodies
app.use(express.json());

// Dynamic CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      // Echo the origin back in the response header
      return callback(null, origin);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies and other credentials
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Import routes
const CourseRoute = require("./Routes/course");
const UserRoute = require("./Routes/user");
const StorageRoute = require("./Routes/storage")

// Setup API routes
app.use("/api/course", CourseRoute);
app.use("/api/user", UserRoute);
app.use("/api/storage",StorageRoute)

// Connect to MongoDB
const connect = () => {
  mongoose.connect(process.env.MONGOURL)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err));
};
connect();

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server Started at Port ${process.env.PORT}`);
});
