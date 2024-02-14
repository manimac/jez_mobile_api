const FunctionModel = (sequelize, Sequelize) => {
     const Function = sequelize.define('Function', {
         title: { type: Sequelize.STRING, allowNull: true },
         status: { type: Sequelize.INTEGER, defaultValue: 1 }
     })
     return Function
 }
 
 module.exports = FunctionModel