// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('sms', 'postgres', '1209', {
//   host: 'localhost',
//   dialect: 'postgres',
// });

// const User = require('./user')(sequelize);
// const UserRole = require('./UserRole')(sequelize);

// User.associate({UserRole});
// UserRole.associate({User});

// module.exports = { sequelize, User, UserRole };

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sms', 'postgres', '1209', {
  host: 'localhost',
  dialect: 'postgres',
});

const db = {};
const modelsPath = __dirname;

// Dynamically import all models
fs.readdirSync(modelsPath)
  .filter(file => file !== 'index.js' && file.endsWith('.js')) // filter all .js models except index.js
  .forEach(file => {
    const model = require(path.join(modelsPath, file))(sequelize);
    db[model.name] = model;
  });                                          // add all models in db object

// Dynamically call associate if defined       // this method like associate the each model
Object.keys(db).forEach(modelName => {         // it store like db.User, db.UserRole
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;   // database connection (sequelize.authentication, sequelize.sync)
db.Sequelize = Sequelize;   // Sequelize class itself -> datatypes and utilities

module.exports = db;
