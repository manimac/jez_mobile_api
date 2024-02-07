const usernotificationModel = (sequelize, Sequelize) => {
     const usernotification = sequelize.define('usernotification', {
         id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
         option: { type: Sequelize.STRING, allowNull: true },
         enable: { type: Sequelize.INTEGER, allowNull: true },
         status: { type: Sequelize.INTEGER, defaultValue: 1 } //1- Success, 2 - failure, 3-In Progress
     })
 
     return usernotification
 }
 
 module.exports = usernotificationModel