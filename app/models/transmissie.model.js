
const TransmissieModel = (sequelize, Sequelize) => {
    const Transmissie = sequelize.define('Transmissie', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return Transmissie
}

module.exports = TransmissieModel