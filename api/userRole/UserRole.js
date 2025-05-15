const { Sequelize, Op } = require('sequelize');
const { UserRole, User, sequelize } = require('../../models');

// Helper functions to map status between integer and string
const statusToString = (status) => (status === 1 ? 'Active' : 'Inactive');
const statusToInteger = (status) => {
  const validStatuses = { Active: 1, Inactive: 2 };
  const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  if (!(normalizedStatus in validStatuses)) throw new Error('Invalid status value');
  return validStatuses[normalizedStatus];
};

// Add Role
module.exports.create = async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const { roleName, status = 'Active' } = req.body;
    if (!roleName || !roleName.trim() || !/^[a-zA-Z0-9\s-_]{1,50}$/.test(roleName)) {
      return res.status(400).send({ status: false, error: 'Role name is required and must be 1-50 alphanumeric characters, spaces, hyphens, or underscores.' });
    }
    const existingRole = await UserRole.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('roleName')),
        roleName.trim().toLowerCase()
      )
    });
    if (existingRole) {
      return res.status(400).send({ status: false, error: `User role '${roleName}' already exists.` });
    }
    const role = await UserRole.create({
      roleName: roleName.trim(),
      status: statusToInteger(status)
    });
    res.status(201).send({
      id: role.id,
      roleName: role.roleName,
      status: statusToString(role.status)
    });
  } catch (error) {
    console.error('Error adding role:', error);
    res.status(400).send({ status: false, error: error.message });
  }
};

// Get Role by ID
module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id) || parseInt(id) <= 0) {
      return res.status(400).send({ status: false, error: 'Invalid role ID. ID must be a positive integer.' });
    }
    const role = await UserRole.findByPk(id, {
      attributes: ['id', 'roleName', 'status']
    });
    if (!role) {
      return res.status(404).send({ status: false, error: 'Role not found' });
    }
    res.send({
      status: true,
      data: {
        id: role.id,
        roleName: role.roleName,
        status: statusToString(role.status)
      }
    });
  } catch (error) {
    console.error('Error fetching role by ID:', error);
    res.status(500).send({ status: false, error: error.message });
  }
};

// Update Role
module.exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id) || parseInt(id) <= 0) {
      return res.status(400).send({ status: false, error: 'Invalid role ID. ID must be a positive integer.' });
    }
    const { roleName, status } = req.body;
    if (!roleName || !roleName.trim() || !/^[a-zA-Z0-9\s-_]{1,50}$/.test(roleName)) {
      return res.status(400).send({ status: false, error: 'Role name is required and must be 1-50 alphanumeric characters, spaces, hyphens, or underscores.' });
    }
    const existingRole = await UserRole.findOne({
      where: {
        id: { [Op.ne]: id },
        [Op.or]: [
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('roleName')),
            roleName.trim().toLowerCase()
          ),
        ],
      },
    });
    if (existingRole) {
      return res.status(400).send({ status: false, error: `User role '${roleName}' already exists.` });
    }
    const role = await UserRole.findByPk(id);
    if (!role) {
      return res.status(404).send({ status: false, error: 'Role not found' });
    }
    await role.update({
      roleName: roleName.trim(),
      status: statusToInteger(status),
    });
    res.send({
      id: role.id,
      roleName: role.roleName,
      status: statusToString(role.status),
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(400).send({ status: false, error: error.message });
  }
};

// Delete Role
module.exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id) || parseInt(id) <= 0) {
      return res.status(400).send({ status: false, error: 'Invalid role ID. ID must be a positive integer.' });
    }
    const role = await UserRole.findByPk(id);
    if (!role) {
      return res.status(404).send({ status: false, error: 'Role not found' });
    }
    await role.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).send({ status: false, error: error.message });
  }
};

// Get Roles with User Counts (for dashboard)
module.exports.getRolesWithUserCount = async (req, res) => {
  try {
    console.log('Starting getRolesWithUserCount...');

    // Verify models are loaded
    if (!UserRole || !User) {
      throw new Error('UserRole or User model not properly defined');
    }
    console.log('Models verified:', { UserRole: !!UserRole, User: !!User });

    // Check if UserRoleId exists in User model
    const userAttributes = Object.keys(User.rawAttributes);
    console.log('User model attributes:', userAttributes);
    if (!userAttributes.includes('UserRoleId')) {
      throw new Error('UserRoleId field not found in User model');
    }

    // Fetch all roles
    const roles = await UserRole.findAll({
      attributes: ['id', 'roleName'],
    });
    console.log('Roles fetched:', roles.map(r => r.toJSON()));

    if (!roles || roles.length === 0) {
      console.warn('No roles found in the database');
      return res.json([]);
    }

    // For each role, count associated users
    const formattedRoles = [];
    for (const role of roles) {
      const userCount = await User.count({
        where: {
          UserRoleId: role.id,
        },
      });
      formattedRoles.push({
        name: role.roleName || 'Unknown Role',
        userCount: userCount || 0,
      });
    }

    console.log('Formatted roles data:', formattedRoles);
    res.json(formattedRoles);
  } catch (error) {
    console.error('Error in getRolesWithUserCount:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get All Roles (for datatable in UserRoles.html)
module.exports.getAllRoles = async (req, res) => {
  try {
    console.log('Starting getAllRoles...');

    // Fetch all roles with id, roleName, and status
    const roles = await UserRole.findAll({
      attributes: ['id', 'roleName', 'status'],
    });

    if (!roles || roles.length === 0) {
      console.warn('No roles found in the database');
      return res.json([]);
    }

    // Format the data for the datatable
    const formattedRoles = roles.map(role => ({
      id: role.id,
      roleName: role.roleName,
      status: statusToString(role.status)
    }));

    console.log('Formatted roles for datatable:', formattedRoles);
    res.json(formattedRoles);
  } catch (error) {
    console.error('Error in getAllRoles:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};