// api/userRole/UserRole.js
const express = require('express');
const router = express.Router();
const { UserRole } = require('../../models');

router.post('/addrole', async (req, res) => {
  try {
    const role = await UserRole.create(req.body);
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



router.get('/getroles', async (req, res) => {
  try {
    const roles = await UserRole.findAll();
    res.json({ data: roles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;