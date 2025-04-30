// api/userRole/index.js
const express = require('express');
const router = express.Router();
router.use('/', require('./UserRole'));
module.exports = router;