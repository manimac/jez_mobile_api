
const BrandstofModel = (sequelize, Sequelize) => {
    const Brandstof = sequelize.define('Brandstof', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return Brandstof
}

module.exports = BrandstofModel