const CouponModel = (sequelize, Sequelize) => {
    const Coupon = sequelize.define('Coupon', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        code: { type: Sequelize.STRING, allowNull: true },
        name: { type: Sequelize.STRING, allowNull: true },
        price: { type: Sequelize.STRING, allowNull: true },
        description: { type: Sequelize.STRING, allowNull: true },
        start: { type: Sequelize.DATE, allowNull: true },
        end: { type: Sequelize.DATE, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return Coupon
}

module.exports = CouponModel