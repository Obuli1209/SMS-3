// api/shiftLogs/shiftLogs.js
const { ShiftLogs, User, Shifts, UserRole } = require('../../models');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
  }
  next();
};

module.exports.getAllShiftLogs = [isAuthenticated, async (req, res) => {
    try {
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
      // Transform data to plain objects to avoid circular references
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
      // Transform data to plain object to avoid circular references
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
      // Validate that the provided role matches the user's role
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
      // Fetch the created shift log with associations
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
      // Transform data to plain object to avoid circular references
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
      const { userId, shiftId, role } = req.body;
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
      // Validate that the provided role matches the user's role
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
      // Fetch the updated shift log with associations
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
      // Transform data to plain object to avoid circular references
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