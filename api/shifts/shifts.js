const { Shifts, User } = require('../../models');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('Checking authentication, session.userId:', req.session.userId);
  if (!req.session.userId) {
    return res.status(401).send({ success: false, message: 'Unauthorized' });
  }
  next();
};

// Create a new shift
module.exports.createShift = [isAuthenticated, async (req, res) => {
  const { name, startTime, endTime } = req.body;

  if (!name || !startTime || !endTime) {
    return res.status(400).send({ success: false, message: 'All fields are required' });
  }

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    const shift = await Shifts.create({
      name,
      startTime,
      endTime,
      // createdBy: user.firstName,
      // updatedBy: user.firstName,
      user: {
        createdBy: { id: user.id, firstName: user.firstName },
        updatedBy: { id: user.id, firstName: user.firstName },
      },
    });

    res.status(201).send({ success: true, data: shift });
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).send({ success: false, message: 'Server error' });
  }
}];

// Get all shifts
module.exports.getAllShifts = [isAuthenticated, async (req, res) => {
  try {
    const shifts = await Shifts.findAll();
    const formattedShifts = shifts.map(shift => ({
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
    }));
    res.send({ success: true, data: formattedShifts });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).send({ success: false, message: 'Server error' });
  }
}];

// Update a shift
module.exports.updateShift = [isAuthenticated, async (req, res) => {
  const { id, name, startTime, endTime } = req.body;

  if (!id || !name || !startTime || !endTime) {
    return res.status(400).send({ success: false, message: 'All fields are required' });
  }

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    const shift = await Shifts.findByPk(id);
    if (!shift) {
      return res.status(404).send({ success: false, message: 'Shift not found' });
    }

    await shift.update({
      name,
      startTime,
      endTime,
      // updatedBy: user.id,
      user: {
        createdBy: shift.user.createdBy,
        updatedBy: { id: user.id, firstName: user.firstName },
      },
    });

    res.send({ success: true, data: shift });
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).send({ success: false, message: 'Server error' });
  }
}];

// Delete a shift
module.exports.deleteShift = [isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const shift = await Shifts.findByPk(id);
    if (!shift) {
      return res.status(404).send({ success: false, message: 'Shift not found' });
    }

    await shift.destroy();
    res.send({ success: true, message: 'Shift deleted' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).send({ success: false, message: 'Server error' });
  }
}];