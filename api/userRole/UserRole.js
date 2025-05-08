const { UserRole, sequelize } = require('../../models');

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
    // Check for existing role (case-insensitive)
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


// Get All Roles
module.exports.getRole = async (req, res) => {
  try {
    const roles = await UserRole.findAll({
      attributes: ['id', 'roleName', 'status']
    });
    const mappedRoles = roles.map(role => ({
      id: role.id,
      roleName: role.roleName,
      status: statusToString(role.status)
    }));
    res.send({ data: mappedRoles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).send({ status: false, error: error.message });
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
    // Check for existing role with same name (case-insensitive), excluding current role
    const existingRole = await UserRole.findOne({
      where: {
        id: { [sequelize.Op.ne]: id },
        [sequelize.Op.or]: [
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('roleName')),
            roleName.trim().toLowerCase()
          )
        ]
      }
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
      status: statusToInteger(status)
    });
    res.send({
      id: role.id,
      roleName: role.roleName,
      status: statusToString(role.status)
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
    // const remainingRoles = await UserRole.count();
    // if (remainingRoles === 0) {
    //   await sequelize.query('ALTER SEQUENCE "UserRoles_id_seq" RESTART WITH 1;');
    // }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).send({ status: false, error: error.message });
  }
};