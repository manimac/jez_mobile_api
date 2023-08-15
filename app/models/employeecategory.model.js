const EmployeeCategoryModel = (sequelize, Sequelize) => {
     const EmployeeCategory = sequelize.define('EmployeeCategory', {
         id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
         status: { type: Sequelize.INTEGER, defaultValue: 1 }
     })
 
     return EmployeeCategory
 }
 
 module.exports = EmployeeCategoryModel