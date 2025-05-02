const express = require('express');
const router = express.Router();
const { UserRole } = require('../../models');

// Helper functions to map status between integer and string
const statusToString = (status) => (status === 1 ? 'Active' : 'Inactive');
const statusToInteger = (status) => {
  const validStatuses = { 'Active': 1, 'Inactive': 2 };
  if (!(status in validStatuses)) throw new Error('Invalid status value');
  return validStatuses[status];
};

// Add Role
const addRole =  async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const { roleName, status = 'Active' } = req.body;
    if (!roleName || !roleName.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    const role = await UserRole.create({
      role: roleName,
      status: statusToInteger(status)
    });
    res.status(201).json({
      id: role.id,
      roleName: role.role,
      status: statusToString(role.status)
    });
  } catch (error) {
    console.error('Error adding role:', error);
    res.status(400).json({ error: error.message || 'Failed to add role' });
  }
};

// Get All Roles
const getRole =  async (req, res) => {
  try {
    const roles = await UserRole.findAll({
      attributes: ['id', 'role', 'status']
    });
    const mappedRoles = roles.map(role => ({
      id: role.id,
      roleName: role.role,
      status: statusToString(role.status)
    }));
    res.json({ data: mappedRoles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Role
const updateRole =  async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, status } = req.body;
    if (!roleName || !roleName.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    const role = await UserRole.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    await role.update({
      role: roleName,
      status: statusToInteger(status)
    });
    res.json({
      id: role.id,
      roleName: role.role,
      status: statusToString(role.status)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Role
const deleteRole =  async (req, res) => {
  try {
    const { id } = req.params;
    const role = await UserRole.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    await role.destroy();

    // Check if table is empty and reset sequence if so
    const remainingRoles = await UserRole.count();
    if (remainingRoles === 0) {
      await req.sequelize.query('ALTER SEQUENCE "UserRoles_id_seq" RESTART WITH 1;');
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {addRole, getRole, updateRole, deleteRole};