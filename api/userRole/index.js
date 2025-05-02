// api/userRole/index.js
const express = require('express');
const router = express.Router();
const { addRole, getRole, updateRole, deleteRole } = require('./userRole');

router.post('/addrole', addRole);
router.get('/getroles', getRole);
router.put('/updaterole/:id', updateRole);
router.delete('/deleterole/:id', deleteRole);

module.exports = router;