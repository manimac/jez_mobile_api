const notificationmasterModel = (sequelize, Sequelize) => {
     const notificationmaster = sequelize.define('notificationmaster', {
         id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
         name: { type: Sequelize.STRING, allowNull: true },
         option: { type: Sequelize.STRING, allowNull: true },
         status: { type: Sequelize.INTEGER, defaultValue: 1 } //1- Success, 2 - failure, 3-In Progress
     })
 
     return notificationmaster
 }
 
 module.exports = notificationmasterModel