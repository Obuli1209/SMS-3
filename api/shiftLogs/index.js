const express = require('express');
const router = express.Router();
const shiftLogsController = require('./shiftLogs');

// Routes for shift logs
router.get('/assignments', shiftLogsController.getShiftAssignments); // dashboard
router.get('/usersbyrole', shiftLogsController.getUsersByRole); // get users from dropdown depends on role
router.get('/', shiftLogsController.getAllShiftLogs);
router.get('/:id', shiftLogsController.getShiftLogById);
router.post('/', shiftLogsController.createShiftLog);
router.put('/:id', shiftLogsController.updateShiftLog);
router.delete('/:id', shiftLogsController.deleteShiftLog);

module.exports = router;