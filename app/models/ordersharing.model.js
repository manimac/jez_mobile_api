const moment = require('moment');
const OrdersharingModel = (sequelize, Sequelize) => {
    const Ordersharing = sequelize.define('Ordersharing', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        owner: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: true },
    })

    return Ordersharing
}

module.exports = OrdersharingModel