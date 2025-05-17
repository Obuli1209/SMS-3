const express = require('express');
const router = express.Router();
const controller = require('./user');

// Use isAdmin for all routes (restored)
router.post('/create', controller.create);
router.post('/login', controller.loginUser);
router.get('/',  controller.getAllUSers);
router.get('/roles', controller.getAllRoles);
router.put('/:id', controller.updateUser);
router.delete('/:id',  controller.deleteUser);
router.get('/count', controller.getUserCount);

module.exports = router;