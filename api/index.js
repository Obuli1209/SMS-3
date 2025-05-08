// api/index.js
const express = require('express');
const path = require('path');

const router = express.Router();

// Redirect to login
router.get('/', (req, res) => res.redirect('/login'));

// Login page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../view', 'login.html'));
});

router.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, '../view', 'Users.html'));
});

router.get('/userroleslist', (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'UserRoles.html'));
 });

 // shifts.html
 router.get('/shifts', (req, res) => {
   res.sendFile(path.join(__dirname, '../view', 'shifts.html'));
 });


router.get('/tables', (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'tables.html'));
});


router.get('/datatables', (req, res) => {
   res.sendFile(path.join(__dirname, '../view', 'datatables.html'));
});

router.get('/error_500', (req, res) => {
  res.sendFile(path.join(__dirname, '../view', 'error_500.html'));
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
