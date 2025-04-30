const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
const {sequelize} = require('./models/index');

//DB connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected successfully');

    await sequelize.sync({ force: false });
    console.log('Tables created');
  } catch (err) {
    console.error('Error:', err);
  }
};
// Call the function
connectDB();

// Middleware for parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/user', require('./api/user')); 

// app.use('/api', require('./api'))


// add new role
app.use('/api/userRole', require('./api/userRole'));



// Use your routes from api/index.js
const routes = require('./api/index');
app.use('/', routes);


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});