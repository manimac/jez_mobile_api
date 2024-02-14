const EmployeeFunctionsModel = (sequelize, Sequelize) => {
     const EmployeeFunctions = sequelize.define('EmployeeFunctions', {
         id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
         status: { type: Sequelize.INTEGER, defaultValue: 1 }
     })
 
     return EmployeeFunctions
 }
 
 module.exports = EmployeeFunctionsModel