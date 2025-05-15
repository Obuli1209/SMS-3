const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const app = express();
const { sequelize } = require('./models/index');

// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// Enable CORS (if frontend is on a different domain/port)
app.use(cors());

// DB connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected successfully');
    await sequelize.sync({ alter: true });
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
  secret: process.env.SESSION_SECRET || '6574839201',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/user', require('./api/user'));
console.log('Mounted /api/user router');
app.use('/api/userroles', require('./api/userRole')); 
console.log('Mounted /api/userroles router');
app.use('/api/shifts', require('./api/shifts/index'));
console.log('Mounted /api/shifts router');
app.use('/api/shiftlogs', require('./api/shiftLogs')); 
console.log('Mounted /api/shiftlogs router');

// Use routes from api/index.js
app.use('/', require('./api/index'));
console.log('Mounted / router');

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});