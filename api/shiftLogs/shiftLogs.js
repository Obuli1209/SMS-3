const { ShiftLogs, User, Shifts, UserRole, Sequelize } = require('../../models');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('Checking authentication for /api/shiftlogs, session.userId:', req.session.userId);
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
  }
  next();
};

// Get all shift logs
module.exports.getAllShiftLogs = [isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching all shift logs...');
    const shiftLogs = await ShiftLogs.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
          include: [
            {
              model: UserRole,
              attributes: ['roleName'],
            },
          ],
        },
        { model: Shifts, attributes: ['id', 'name'] },
      ],
    });
    const transformedData = shiftLogs.map(log => {
      const logPlain = log.toJSON();
      return {
        ...logPlain,
        User: {
          id: logPlain.User.id,
          firstName: logPlain.User.firstName,
          lastName: logPlain.User.lastName,
          role: logPlain.User.UserRole ? logPlain.User.UserRole.roleName : null,
        },
      };
    });
    res.status(200).json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Error fetching shift logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shift logs' });
  }
}];

// Get a single shift log by ID
module.exports.getShiftLogById = [isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching shift log by ID:', id);

    // Validate ID is a positive integer
    if (!/^\d+$/.test(id) || parseInt(id) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid shift log ID. ID must be a positive integer.' });
    }

    const shiftLog = await ShiftLogs.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
          include: [
            {
              model: UserRole,
              attributes: ['roleName'],
            },
          ],
        },
        { model: Shifts, attributes: ['id', 'name'] },
      ],
    });
    if (!shiftLog) {
      return res.status(404).json({ success: false, message: 'Shift log not found' });
    }
    const logPlain = shiftLog.toJSON();
    const transformedData = {
      ...logPlain,
      User: {
        id: logPlain.User.id,
        firstName: logPlain.User.firstName,
        lastName: logPlain.User.lastName,
        role: logPlain.User.UserRole ? logPlain.User.UserRole.roleName : null,
      },
    };
    res.status(200).json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Error fetching shift log:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shift log' });
  }
}];

// Create a new shift log
module.exports.createShiftLog = [isAuthenticated, async (req, res) => {
  try {
    console.log('Creating shift log with body:', req.body);
    const { userId, shiftId, role } = req.body;
    const user = await User.findByPk(userId, {
      include: [{ model: UserRole, attributes: ['roleName'] }],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const shift = await Shifts.findByPk(shiftId);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    const userRoleName = user.UserRole ? user.UserRole.roleName : null;
    if (role !== userRoleName) {
      return res.status(400).json({ success: false, message: 'Provided role does not match user role' });
    }
    const shiftLog = await ShiftLogs.create({
      userId,
      shiftId,
      user: {
        createdBy: { id: userId, firstName: user.firstName },
        updatedBy: { id: userId, firstName: user.firstName },
      },
    });
    const createdShiftLog = await ShiftLogs.findByPk(shiftLog.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
          include: [
            {
              model: UserRole,
              attributes: ['roleName'],
            },
          ],
        },
        { model: Shifts, attributes: ['id', 'name'] },
      ],
    });
    const logPlain = createdShiftLog.toJSON();
    const transformedData = {
      ...logPlain,
      User: {
        id: logPlain.User.id,
        firstName: logPlain.User.firstName,
        lastName: logPlain.User.lastName,
        role: logPlain.User.UserRole ? logPlain.User.UserRole.roleName : null,
      },
    };
    res.status(201).json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Error creating shift log:', error);
    res.status(500).json({ success: false, message: 'Failed to create shift log' });
  }
}];

// Update a shift log
module.exports.updateShiftLog = [isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating shift log ID:', id);
    const { userId, shiftId, role } = req.body;

    // Validate ID
    if (!/^\d+$/.test(id) || parseInt(id) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid shift log ID. ID must be a positive integer.' });
    }

    const shiftLog = await ShiftLogs.findByPk(id);
    if (!shiftLog) {
      return res.status(404).json({ success: false, message: 'Shift log not found' });
    }
    const user = await User.findByPk(userId, {
      include: [{ model: UserRole, attributes: ['roleName'] }],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const shift = await Shifts.findByPk(shiftId);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    const userRoleName = user.UserRole ? user.UserRole.roleName : null;
    if (role !== userRoleName) {
      return res.status(400).json({ success: false, message: 'Provided role does not match user role' });
    }
    await shiftLog.update({
      userId,
      shiftId,
      user: {
        ...shiftLog.user,
        updatedBy: { id: userId, firstName: user.firstName },
      },
    });
    const updatedShiftLog = await ShiftLogs.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
          include: [
            {
              model: UserRole,
              attributes: ['roleName'],
            },
          ],
        },
        { model: Shifts, attributes: ['id', 'name'] },
      ],
    });
    const logPlain = updatedShiftLog.toJSON();
    const transformedData = {
      ...logPlain,
      User: {
        id: logPlain.User.id,
        firstName: logPlain.User.firstName,
        lastName: logPlain.User.lastName,
        role: logPlain.User.UserRole ? logPlain.User.UserRole.roleName : null,
      },
    };
    res.status(200).json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Error updating shift log:', error);
    res.status(500).json({ success: false, message: 'Failed to update shift log' });
  }
}];

// Delete a shift log
module.exports.deleteShiftLog = [isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting shift log ID:', id);

    // Validate ID
    if (!/^\d+$/.test(id) || parseInt(id) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid shift log ID. ID must be a positive integer.' });
    }

    const shiftLog = await ShiftLogs.findByPk(id);
    if (!shiftLog) {
      return res.status(404).json({ success: false, message: 'Shift log not found' });
    }
    await shiftLog.destroy();
    res.status(200).json({ success: true, message: 'Shift log deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift log:', error);
    res.status(500).json({ success: false, message: 'Failed to delete shift log' });
  }
}];

// Get shift assignments with employee counts (for dashboard)
module.exports.getShiftAssignments = [isAuthenticated, async (req, res) => {
  try {
    console.log('Starting getShiftAssignments...');

    // Verify models
    if (!ShiftLogs || !Shifts) {
      throw new Error('ShiftLogs or Shifts model not properly defined');
    }
    console.log('Models verified:', { ShiftLogs: !!ShiftLogs, Shifts: !!Shifts });

    // Fetch all shifts
    const shifts = await Shifts.findAll({
      attributes: ['id', 'name'],
    });
    console.log('Shifts fetched:', shifts.map(s => s.toJSON()));

    if (!shifts || shifts.length === 0) {
      console.warn('No shifts found in the database');
      return res.json([]);
    }

    // For each shift, count associated shift logs
    const formattedAssignments = [];
    for (const shift of shifts) {
      const employeeCount = await ShiftLogs.count({
        where: {
          shiftId: shift.id,
        },
      });
      formattedAssignments.push({
        shiftName: shift.name || 'Unknown Shift',
        employeeCount: employeeCount || 0,
      });
    }

    console.log('Formatted shift assignments:', formattedAssignments);
    res.json(formattedAssignments);
  } catch (error) {
    console.error('Error in getShiftAssignments:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}];