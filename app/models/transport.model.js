const TransportModel = (sequelize, Sequelize) => {
    const Transport = sequelize.define('Transport', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        priceperhr: { type: Sequelize.FLOAT, allowNull: true },
        peekpriceperhr: { type: Sequelize.FLOAT, allowNull: true },
        route: { type: Sequelize.STRING, allowNull: true },
        points: { type: Sequelize.TEXT, allowNull: true },
        description: { type: Sequelize.STRING, allowNull: true },
        image: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        showinindex: { type: Sequelize.INTEGER, defaultValue: 0 },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/transport/`
            }
        }
    })

    return Transport
}

module.exports = TransportModel