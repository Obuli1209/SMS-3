const { User } = require('./models');
const bcrypt = require('bcrypt');

async function migratePasswords() {
  try {
    // Fetch all users
    const users = await User.findAll();

    // Update each user's password
    for (const user of users) {
      // Check if password is already a bcrypt hash (starts with $2b$)
      if (!user.password.startsWith('$2b$')) {
        console.log(`Hashing password for user: ${user.username}`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await user.update({ password: hashedPassword });
        console.log(`Updated password for user: ${user.username}`);
      }
    }

    console.log('Password migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during password migration:', error);
    process.exit(1);
  }
}

migratePasswords();