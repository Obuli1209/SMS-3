// api/user/index.js
const express = require('express');
const router = express.Router();
const { getAllUsers ,loginUser} = require('./user');




router.post('/login',loginUser);




module.exports = router;

