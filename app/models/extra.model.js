const ExtraModel = (sequelize, Sequelize) => {
    const Extra = sequelize.define('Extra', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        // type: { type: Sequelize.STRING, allowNull: true },
        description: { type: Sequelize.STRING, allowNull: true },
        price: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        isGroup: { type: Sequelize.BOOLEAN, defaultValue: 0 }
    })

    return Extra
}

module.exports = ExtraModel