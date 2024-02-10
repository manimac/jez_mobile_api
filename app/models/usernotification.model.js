const usernotificationModel = (sequelize, Sequelize) => {
     const usernotification = sequelize.define('usernotification', {
         id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
         hoursaccepted: { type: Sequelize.INTEGER, allowNull: true },
         hoursrejected: { type: Sequelize.INTEGER, allowNull: true },
         rejectedassignments: { type: Sequelize.INTEGER, allowNull: true },
         acceptedassignments: { type: Sequelize.INTEGER, allowNull: true },
         newassignments: { type: Sequelize.INTEGER, allowNull: true },
         newassignmentsoption: { type: Sequelize.STRING, allowNull: true },
         rememberassignments: { type: Sequelize.INTEGER, allowNull: true },
         rememberassignmentsoption: { type: Sequelize.STRING, allowNull: true },
         status: { type: Sequelize.INTEGER, defaultValue: 1 } //1- Success, 2 - failure, 3-In Progress
     })
 
     return usernotification
 }
 
 module.exports = usernotificationModel