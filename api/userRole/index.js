const express = require('express');
const router = express.Router();
const userRoleController  = require('./UserRole');

// Define routes for user roles
router.get('/', userRoleController.getRolesWithUserCount); // dashboard
router.get('/list', userRoleController.getAllRoles); // datatable
router.post('/', userRoleController.create); 
router.get('/:id', userRoleController.getById); 
router.put('/:id', userRoleController.updateRole); 
router.delete('/:id', userRoleController.deleteRole); 

module.exports = router;