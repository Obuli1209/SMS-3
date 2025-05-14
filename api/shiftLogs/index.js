// api/shiftLogs/index.js
const express = require('express');
const router = express.Router();
const shiftLogsController = require('./shiftLogs');



// router.use(isAuthenticated);

// Routes for shift logs
router.get('/', shiftLogsController.getAllShiftLogs);
router.get('/:id', shiftLogsController.getShiftLogById);
router.post('/', shiftLogsController.createShiftLog);
router.put('/:id', shiftLogsController.updateShiftLog);
router.delete('/:id', shiftLogsController.deleteShiftLog);

module.exports = router;