const specificationModel = (sequelize, Sequelize) => {
    const specification = sequelize.define('specification', {
        name: { type: Sequelize.STRING },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return specification
}

module.exports = specificationModel