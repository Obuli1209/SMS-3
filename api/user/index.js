// api/user/index.js
const express = require('express');
const router = express.Router();
// const {loginUser} = require('./user');
const controller = require('./user');




router.post('/login',controller.loginUser);
// router.use('/user', userRoutes);
router.get('/', controller.getAllUSers);
router.get('/roles', controller.getAllRoles);
router.post('/',controller.create);
router.put('/:id',controller.update);
router.delete('/:id',controller.deleteUser);






module.exports = router;