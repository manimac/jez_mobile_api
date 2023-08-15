const EmployeeExperienceModel = (sequelize, Sequelize) => {
     const EmployeeExperience = sequelize.define('EmployeeExperience', {
         id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
         experience: { type: Sequelize.STRING(1555),allowNull: true },
         status: { type: Sequelize.INTEGER, defaultValue: 1 }
     })
 
     return EmployeeExperience
 }
 
 module.exports = EmployeeExperienceModel