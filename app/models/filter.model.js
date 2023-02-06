const FilterModel = (sequelize, Sequelize) => {
    const filter = sequelize.define('filter', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: false },
        category: { type: Sequelize.STRING, allowNull: false },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return filter
}

module.exports = FilterModel