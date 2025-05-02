// api/user/index.js
const express = require('express');
const router = express.Router();
const { getAllUsers ,loginUser} = require('./user');

router.get('/users', getAllUsers);

router.post('/login',loginUser);

// routes/users.js
router.get('/api/users', async (req, res) => {
    try {
      const users = await User.findAll({
        include: {
          model: UserRole,
          attributes: ['name']
        }
      });
  
      // map roleName and return clean JSON
      const userData = users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        roleName: user.UserRole?.name || 'N/A',  // <-- mapped from UserRole
        status: user.status
      }));
  
      res.json({ data: userData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  



module.exports = router;

