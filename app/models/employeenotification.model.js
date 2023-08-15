const EmployeeNotificationModel = (sequelize, Sequelize) => {
     const EmployeeNotification = sequelize.define('EmployeeNotification', {
         id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
         message: { type: Sequelize.INTEGER, allowNull: true },
         status: { type: Sequelize.INTEGER, defaultValue: 1 }
     })
 
     return EmployeeNotification
 }
 
 module.exports = EmployeeNotificationModel