
const TransportMenuModel = (sequelize, Sequelize) => {
    const TransportMenu = sequelize.define('TransportMenu', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return TransportMenu
}

module.exports = TransportMenuModel