const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Shifts = sequelize.define('Shifts', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    user: {
      type: DataTypes.JSONB,
      allowNull: false, // Stores { createdBy: { id: userId, firstName: "FirstName" }, updatedBy: { id: userId, firstName: "FirstName" } }
    }
  });

  return Shifts;
};