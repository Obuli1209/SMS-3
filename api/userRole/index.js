const express = require('express');
const router = express.Router();
const controller = require('./userRole');

router.post('/', controller.create);
router.get('/', controller.getRole);
router.get('/:id', controller.getById);
router.put('/:id', controller.updateRole); 
router.delete('/:id', controller.deleteRole);

module.exports = router;