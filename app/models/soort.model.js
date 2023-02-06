
const SoortModel = (sequelize, Sequelize) => {
    const Soort = sequelize.define('Soort', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return Soort
}

module.exports = SoortModel