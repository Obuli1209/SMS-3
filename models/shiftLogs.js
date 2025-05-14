const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ShiftLogs = sequelize.define('ShiftLogs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user: {
      type: DataTypes.JSONB,
      allowNull: false, // Stores { createdBy: { id: userId, firstName: "FirstName" }, updatedBy: { id: userId, firstName: "FirstName" } }
    }
  });

  ShiftLogs.associate = (models) => {
    ShiftLogs.belongsTo(models.Shifts, { foreignKey: 'shiftId' });
    ShiftLogs.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return ShiftLogs;
};