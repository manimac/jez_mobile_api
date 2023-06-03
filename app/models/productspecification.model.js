const productspecificationModel = (sequelize, Sequelize) => {
    const productspecification = sequelize.define('productspecification', {
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return productspecification
}

module.exports = productspecificationModel