// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors'); // Add CORS - cross origin resource sharing
const app = express();
const { sequelize } = require('./models/index');
const userRoutes = require('./api/user');


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
  secret: process.env.SESSION_SECRET || '6574839201',
  resave: false,
  saveUninitialized: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', userRoutes);
app.use('/api/user', require('./api/user'));
app.use('/api/userRole', require('./api/userRole'));
// app.use('/api/shifts', require('./api/shifts'));

// app.get('/users', (req, res) => {
//   res.sendFile(path.join(__dirname, 'view', 'Users.html'));
// });

// Use your routes from api/index.js
app.use('/', require('./api/index'));

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