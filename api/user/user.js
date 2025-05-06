//api/user/user.js
const { User, UserRole } = require('../../models');
const express = require('express');
const router = express.Router();


//login 
module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    if (password !== user.password) {
      return res.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.userRole = user.userRoleId;

    res.send({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ success: false, message: 'Server error' });
  }
};


// Get all users
module.exports.getAllUSers =  async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: UserRole, attributes: ['roleName'] }],
    });
    res.send({
      data: users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.UserRole ? user.UserRole.roleName : 'N/A',
        status: user.status === 1 ? 'Active' : 'Inactive',
      })),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Get all roles for dropdown
module.exports.getAllRoles = async (req, res) => {
  try {
    const roles = await UserRole.findAll({
      attributes: ['id', 'roleName'],
    });
    res.send(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Add a new user
module.exports.create =  async (req, res) => {
  try {
    const { roleId, firstName, lastName, username, password, email, phone } = req.body;
    const user = await User.create({
      id: await User.max('id') + 1, 
      firstName,
      lastName,
      username,
      password,
      email,
      phone,
      UserRoleId: roleId,
      status: 1, // Default to Active
    });
    res.send({ message: 'User added successfully', user });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Update a user
module.exports.update =  async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId, firstName, lastName, username, password, email, phone, status } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    await user.update({
      firstName,
      lastName,
      username,
      password: password || user.password, // Update password only if provided
      email,
      phone,
      UserRoleId: roleId,
      status: status === 'Active' ? 1 : 2,
    });
    res.send({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};


// Delete a user
module.exports.deleteUser =  async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    await user.destroy();
    // const remainingRoles = await UserRole.count();
    // if (remainingRoles === 0) {
    //   await sequelize.query('ALTER SEQUENCE "UserRoles_id_seq" RESTART WITH 1;');
    // }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};