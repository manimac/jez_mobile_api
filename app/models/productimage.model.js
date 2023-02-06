const ProductimageModel = (sequelize, Sequelize) => {
    const Productimage = sequelize.define('Productimage', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        image: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/product/`
            }
        }
    })

    return Productimage
}

module.exports = ProductimageModel