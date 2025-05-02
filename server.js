// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors'); // Add CORS
const app = express();
const { sequelize } = require('./models/index');

// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// Enable CORS (optional, if frontend is on a different domain/port)
app.use(cors());

// DB connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected successfully');

    await sequelize.sync({ alter: true});
    console.log('Tables created');
  } catch (err) {
    console.error('Error:', err);
  }
};
// Call the function
connectDB();

// Middleware for parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || '6574839201', // Use environment variable or fallback
  resave: false,
  saveUninitialized: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/user', require('./api/user'));
app.use('/api/userRole', require('./api/userRole'));

// Use your routes from api/index.js (optional, if you want to include all API routes)
const routes = require('./api/index');
app.use('/', routes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});