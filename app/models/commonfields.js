var Sequelize = require('sequelize');
const MODELS = require("../models");
const userModel = MODELS.users;
module.exports = {
  created_by: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: userModel,
      key: 'id',
    }
  },
  updated_by: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: userModel,
      key: 'id',
    }
  }
}