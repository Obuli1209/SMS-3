const express = require('express');
const router = express.Router();
const shiftsController = require('./shifts');

router.post('/', shiftsController.createShift);
router.get('/', shiftsController.getAllShifts);
router.put('/', shiftsController.updateShift);
router.delete('/:id', shiftsController.deleteShift);

module.exports = router;