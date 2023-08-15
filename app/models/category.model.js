const CategoryModel = (sequelize, Sequelize) => {
     const Category = sequelize.define('Category', {
         id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
         icon1: { type: Sequelize.STRING, allowNull: true },
         icon2: { type: Sequelize.STRING, allowNull: true },
         title: { type: Sequelize.STRING, allowNull: true },
         status: { type: Sequelize.INTEGER, defaultValue: 1 }
     })
 
     return Category
 }
 
 module.exports = CategoryModel