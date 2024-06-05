
const FuelModel = (sequelize, Sequelize) => {
    const Fuel = sequelize.define('Fuel', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        gas: { type: Sequelize.TEXT, allowNull: true },
        petrol: { type: Sequelize.TEXT, allowNull: true },
        electric: { type: Sequelize.TEXT, allowNull: true },
        diesel: { type: Sequelize.TEXT, allowNull: true }
    })

    return Fuel
}

module.exports = FuelModel