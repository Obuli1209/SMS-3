const { Shifts, User } = require("../../models");

// Helper: Validate 24-hour format (e.g., "14:30")
const validate24HourTime = (time) => {
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
};

// Helper: Convert 24-hour to 12-hour format
const to12HourFormat = (time24) => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Middleware: Auth check
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send({ success: false, message: "Unauthorized" });
  }
  next();
};

// Create shift
module.exports.createShift = [
  isAuthenticated,
  async (req, res) => {
    const { name, startTime, endTime } = req.body;

    if (!name || !startTime || !endTime) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required" });
    }

    if (!validate24HourTime(startTime) || !validate24HourTime(endTime)) {
      return res
        .status(400)
        .send({
          success: false,
          message: "Times must be in 24-hour format (HH:MM)"
        });
    }

    if (startTime === endTime){
      return res
      .status(400)
      .send({
        success: false,
        message: "Start time and End time should not be same"
      });
    }

    try {
      const user = await User.findByPk(req.session.userId);
      if (!user) {
        return res
          .status(404)
          .send({ success: false, message: "User not found" });
      }

      const shift = await Shifts.create({
        name,
        startTime,
        endTime,
        user: {
          createdBy: { id: user.userId, firstName: user.firstName },
          updatedBy: { id: user.userId, firstName: user.firstName },
        },
      });
      
      res.status(201).send({ success: true, data: shift });
    } catch (error) {
      console.error("Error creating shift:", error);
      res.status(500).send({ success: false, message: "Server error" });
    }
  },
];

// Get all shifts
module.exports.getAllShifts = [
  isAuthenticated,
  async (req, res) => {
    try {
      const shifts = await Shifts.findAll();
      const formatted = shifts.map((shift) => ({
        id: shift.id,
        name: shift.name,
        startTime: to12HourFormat(shift.startTime),
        endTime: to12HourFormat(shift.endTime),
      }));
      res.send({ success: true, data: formatted });
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).send({ success: false, message: "Server error" });
    }
  },
];

// Update shift
module.exports.updateShift = [
  isAuthenticated,
  async (req, res) => {
    const { id, name, startTime, endTime } = req.body;

    if (!id || !name || !startTime || !endTime) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required" });
    }

    if (!validate24HourTime(startTime) || !validate24HourTime(endTime)) {
      return res
        .status(400)
        .send({
          success: false,
          message: "Times must be in 24-hour format (HH:MM)",
        });
    }

    if (startTime === endTime){
      return res
      .status(400)
      .send({
        success: false,
        message: "Start time and End time should not be same"
      });
    }

    try {
      const user = await User.findByPk(req.session.userId);
      if (!user) {
        return res
          .status(404)
          .send({ success: false, message: "User not found" });
      }

      const shift = await Shifts.findByPk(id);
      if (!shift) {
        return res
          .status(404)
          .send({ success: false, message: "Shift not found" });
      }

      await shift.update({
        name,
        startTime,
        endTime,
      });

      res.send({ success: true, data: shift });
    } catch (error) {
      console.error("Error updating shift:", error);
      res.status(500).send({ success: false, message: "Server error" });
    }
  },
];

// Delete shift
module.exports.deleteShift = [
  isAuthenticated,
  async (req, res) => {
    const { id } = req.params;

    try {
      const shift = await Shifts.findByPk(id);
      if (!shift) {
        return res
          .status(404)
          .send({ success: false, message: "Shift not found" });
      }

      await shift.destroy();
      res.send({ success: true, message: "Shift deleted" });
    } catch (error) {
      console.error("Error deleting shift:", error);
      res.status(500).send({ success: false, message: "Server error" });
    }
  },
];
