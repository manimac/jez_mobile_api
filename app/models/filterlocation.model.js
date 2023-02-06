const FilterLocationModel = (sequelize, Sequelize) => {
    const FilterLocation = sequelize.define('FilterLocation', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
    })

    return FilterLocation
}

module.exports = FilterLocationModel