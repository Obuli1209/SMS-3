const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserRole = sequelize.define('UserRole', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1   // Active-1, Inactive-2
    }
  });

  UserRole.associate = (models) => {
    UserRole.hasMany(models.User);
  };

  return UserRole;
};
