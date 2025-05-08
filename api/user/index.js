const express = require('express');
const router = express.Router();
const controller = require('./user');

router.post('/login', controller.loginUser);
router.get('/', controller.getAllUSers);
router.get('/roles', controller.getAllRoles);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;