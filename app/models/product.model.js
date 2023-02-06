const ProductModel = (sequelize, Sequelize) => {
    const Product = sequelize.define('Product', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        route: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: true },
        thumbnail: { type: Sequelize.STRING, allowNull: true },
        priceperhr: { type: Sequelize.STRING, allowNull: true },
        shortdescription: { type: Sequelize.STRING, allowNull: true },
        availabledays: { type: Sequelize.STRING, allowNull: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        showinindex: { type: Sequelize.INTEGER, defaultValue: 0 },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/product/`
            }
        }
        // fuel: { type: Sequelize.STRING, allowNull: true },
        // transmission: { type: Sequelize.STRING, allowNull: true },
        // parkingspace: { type: Sequelize.STRING, allowNull: true },
        // storagespace: { type: Sequelize.STRING, allowNull: true },
        // beroep: { type: Sequelize.STRING, allowNull: true },
        // leeftijd: { type: Sequelize.STRING, allowNull: true },
        // ervaring: { type: Sequelize.STRING, allowNull: true },
        // nationality: { type: Sequelize.STRING, allowNull: true },
        // voertuig: { type: Sequelize.STRING, allowNull: true },
    })

    return Product
}

module.exports = ProductModel