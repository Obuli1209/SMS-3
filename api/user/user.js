const { User, UserRole } = require('../../models');
const bcrypt = require('bcrypt');
const sendMail = require('../../utils/mailer');

// Validation patterns
const namePattern = /^[A-Za-z]{2,30}$/;
const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
const phonePattern = /^[1-9][0-9]{9}$/;
const usernamePattern = /^[A-Za-z0-9]{3,20}$/;
const passwordMinLength = 6;

// Middleware to check if user is authenticated and an Admin
module.exports.isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send({ success: false, error: 'Unauthorized: Please log in' });
  }
  const user = await User.findByPk(req.session.userId, {
    include: [{ model: UserRole, attributes: ['roleName'] }],
  });
  const roleName = user?.UserRole?.roleName || 'N/A';
  if (roleName !== 'Admin') {
    return res.status(403).send({ success: false, error: 'Access denied: Admins only' });
  }
  next();
};

// Create a new user
module.exports.create = async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, password, role, id } = req.body;

    console.log('Create user request:', { firstName, lastName, username, email, phone, role, id }); // Debugging

    // Check for missing fields
    if (!firstName || !lastName || !username || !email || !phone || !password || !role) {
      return res.status(400).send({ success: false, error: 'All fields are required' });
    }

    // Warn if id is provided
    if (id) {
      console.warn('Ignoring provided id:', id);
    }

    // Validate inputs
    if (!namePattern.test(firstName)) {
      return res.status(400).send({ success: false, error: 'First name must be 2-30 characters long and contain only letters' });
    }
    if (!namePattern.test(lastName)) {
      return res.status(400).send({ success: false, error: 'Last name must be 2-30 characters long and contain only letters' });
    }
    if (!usernamePattern.test(username)) {
      return res.status(400).send({ success: false, error: 'Username must be 3-20 characters long and contain only letters and numbers' });
    }
    if (!emailPattern.test(email)) {
      return res.status(400).send({ success: false, error: 'Invalid email format. Must be like user@domain.com, supporting multiple subdomains and TLDs (e.g., .com, .org, .co.uk)' });
    }
    if (!phonePattern.test(phone)) {
      return res.status(400).send({ success: false, error: 'Phone number must be a 10-digit number starting with 1-9' });
    }
    if (password.length < passwordMinLength) {
      return res.status(400).send({ success: false, error: 'Password must be at least 6 characters long' });
    }

    // Validate role (accept roleName or roleId)
    let userRole;
    if (typeof role === 'number' || !isNaN(parseInt(role))) {
      userRole = await UserRole.findByPk(parseInt(role));
    } else {
      userRole = await UserRole.findOne({ where: { roleName: role } });
    }

    if (!userRole) {
      console.log('Invalid role:', role); // Debugging
      return res.status(400).send({ success: false, error: `Invalid role: ${role}. Must be a valid role from the database.` });
    }

    // Check for duplicates
    if (await User.findOne({ where: { email } })) {
      return res.status(400).send({ success: false, error: 'Email already exists' });
    }
    if (await User.findOne({ where: { username } })) {
      return res.status(400).send({ success: false, error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user 
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      phone,
      password: hashedPassword,
      UserRoleId: userRole.id,
      status: 1,
    });

    // Send welcome email
    await sendMail({
      to: email,
      subject: 'Welcome to Shift Management System!',
      html: `
        <h3>Hello ${firstName} ${lastName},</h3>
        <p>Your account has been successfully created.</p>
        <p><strong>Username:</strong> ${username}</p>
        <p>Welcome aboard!</p>
        <p>Regards,<br/>Shift Management Team</p>
      `
    });

    res.status(201).send({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: userRole.roleName,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send({ success: false, error: 'Server error' });
  }
};

// Login user
module.exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({ success: false, error: 'Username and password are required' });
    }

    const user = await User.findOne({
      where: { username },
      include: [{ model: UserRole, attributes: ['roleName'] }],
    });

    if (!user) {
      return res.status(401).send({ success: false, error: 'Invalid credentials' });
    }

    const isHashed = user.password.startsWith('$2b$');
    let isValidPassword;

    if (isHashed) {
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      isValidPassword = password === user.password;
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await user.update({ password: hashedPassword });
        console.log(`Updated plaintext password to hash for user: ${username}`);
      }
    }

    if (!isValidPassword) {
      return res.status(401).send({ success: false, error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.userRole = user.UserRoleId;

    res.send({
      success: true,
      message: 'Login successful',
      data: { id: user.id, firstName: user.firstName },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ success: false, error: 'Server error' });
  }
};

// Get all users
module.exports.getAllUSers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: UserRole, attributes: ['roleName'] }],
    });
    res.send({
      success: true,
      data: users.map((user) => ({
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
    res.status(500).send({ success: false, error: 'Server error' });
  }
};

// Get all roles for dropdown
module.exports.getAllRoles = async (req, res) => {
  try {
    const roles = await UserRole.findAll({
      attributes: ['id', 'roleName'],
    });
    console.log('Roles fetched:', roles); // Debugging
    if (roles.length === 0) {
      return res.status(404).send({ success: false, error: 'No roles found in the database.' });
    }
    res.send(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).send({ success: false, error: 'Server error' });
  }
};

// Deprecated: Redirect to create
module.exports.createUser = async (req, res) => {
  return res.status(400).send({ success: false, error: 'Use /create endpoint for user creation' });
};

// Update a user
module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      roleId,
      firstName,
      lastName,
      username,
      password,
      email,
      phone,
      status
    } = req.body;

        // Prevent updating user with ID 1
    if (parseInt(id) === 1) {
      return res.status(403).send({ success: false, error: 'Cannot edit default admin user' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ success: false, error: 'User not found' });
    }

    // Validate fields
    if (firstName && !namePattern.test(firstName)) {
      return res.status(400).send({ success: false, error: 'First name must be 2-30 characters long and contain only letters' });
    }
    if (lastName && !namePattern.test(lastName)) {
      return res.status(400).send({ success: false, error: 'Last name must be 2-30 characters long and contain only letters' });
    }
    if (username && !usernamePattern.test(username)) {
      return res.status(400).send({ success: false, error: 'Username must be 3-20 characters long and contain only letters and numbers' });
    }
    if (email && !emailPattern.test(email)) {
      return res.status(400).send({ success: false, error: 'Invalid email format' });
    }
    if (phone && !phonePattern.test(phone)) {
      return res.status(400).send({ success: false, error: 'Phone number must be a 10-digit number starting with 1-9' });
    }
    if (password && password.length < passwordMinLength) {
      return res.status(400).send({ success: false, error: 'Password must be at least 6 characters long' });
    }

    // Check for uniqueness
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).send({ success: false, error: 'Email already exists' });
      }
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).send({ success: false, error: 'Username already exists' });
      }
    }

    // Convert status string ("Active"/"Inactive") to integer (1/2)
    let parsedStatus = user.status;
    if (typeof status === 'string') {
      if (status.toLowerCase() === 'active') parsedStatus = 1;
      else if (status.toLowerCase() === 'inactive') parsedStatus = 2;
      else return res.status(400).send({ success: false, error: 'Invalid status value' });
    } else if (typeof status === 'number') {
      parsedStatus = status;
    }

    // Prepare fields to update
    let updatedFields = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      username: username || user.username,
      email: email || user.email,
      phone: phone || user.phone,
      status: parsedStatus,
    };

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    if (roleId) {
      const userRole = await UserRole.findByPk(roleId);
      if (!userRole) {
        return res.status(400).send({ success: false, error: 'Invalid role ID' });
      }
      updatedFields.UserRoleId = roleId;
    }

    await user.update(updatedFields);

    // Send update email
    await sendMail({
      to: updatedFields.email,
      subject: 'Your account has been updated',
      html: `
        <h3>Hello ${updatedFields.firstName},</h3>
        <p>Your account information has been updated successfully.</p>
        <ul>
          <li><strong>Username:</strong> ${updatedFields.username}</li>
          <li><strong>Email:</strong> ${updatedFields.email}</li>
          <li><strong>Phone no:</strong> ${updatedFields.phone}</li>
          <li><strong>Status:</strong> ${parsedStatus === 1 ? 'Active' : 'Inactive'}</li>
        </ul>
        <p>If you did not request this update, please contact Shift Management Team immediately.</p>
      `
    });

    res.send({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ success: false, error: 'Server error' });
  }
};


// Delete a user
module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting user with ID 1
    if (parseInt(id) === 1) {
      return res.status(403).send({ success: false, error: 'Cannot delete default admin user' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ success: false, error: 'User not found' });
    }

    // Send deletion email
    await sendMail({
      to: user.email,
      subject: 'Account Deleted',
      html: `
        <h3>Hello ${user.firstName},</h3>
        <p>Your account associated with this email has been deleted from our system.</p>
        <p>If you believe this was a mistake, please contact Shift Management Team immediately.</p>
      `
    });

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ success: false, error: 'Server error' });
  }
};

// Get user count for dashboard
module.exports.getUserCount = async (req, res) => {
  try {
    const count = await User.count();
    res.send({ success: true, count });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).send({ success: false, error: 'Server error' });
  }
};