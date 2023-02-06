
const FilterCityModel = (sequelize, Sequelize) => {
    const FilterCity = sequelize.define('FilterCity', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return FilterCity
}

module.exports = FilterCityModel