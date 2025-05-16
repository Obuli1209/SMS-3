// api/index.js
const express = require('express');
const path = require('path');
const router = express.Router();

// Middleware
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  next();
};

// Redirect to login
router.get('/', (req, res) => res.redirect('/login'));

// Login page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../view', 'login.html'));
});

router.get('/users',  isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../view', 'Users.html'));
});

router.get('/userroleslist', isAuthenticated,  (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'UserRoles.html'));
 });

 // shifts.html
 router.get('/shifts',  isAuthenticated,  (req, res) => {
   res.sendFile(path.join(__dirname, '../view', 'shifts.html'));
 });


 // Add this route with other routes in api/index.js
router.get('/shiftLogs',  isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../view', 'shiftLogs.html'));
});

// Protected index page
router.get('/index', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../view', 'index.html'));
});

// Check session
router.get('/check-session', (req, res) => {
  if (req.session.userId) {
    return res.status(200).send({ success: true, message: 'Session active' });
  } else {
    return res.status(401).send({ success: false, message: 'No active session' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Failed to logout');
    res.redirect('/login');
  });
});

module.exports = router;
