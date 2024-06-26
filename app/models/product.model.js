const ProductModel = (sequelize, Sequelize) => {
    const Product = sequelize.define('Product', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        route: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: true },
        qnr: { type: Sequelize.STRING, allowNull: true },
        lat: { type: Sequelize.STRING, allowNull: true },
        lng: { type: Sequelize.STRING, allowNull: true },
        location: { type: Sequelize.TEXT, allowNull: true },
        vehicletype: { type: Sequelize.STRING, allowNull: true }, // Car, Van, Truck
        thumbnail: { type: Sequelize.STRING, allowNull: true },
        priceperhr: { type: Sequelize.STRING, allowNull: true },
        priceperday: { type: Sequelize.STRING, allowNull: true },
        adavanceamountforday: { type: Sequelize.STRING, allowNull: true },
        noofseats: { type: Sequelize.STRING, allowNull: true },
        acceleration: { type: Sequelize.STRING, allowNull: true },
        shortdescription: { type: Sequelize.STRING, allowNull: true },
        availabledays: { type: Sequelize.STRING, allowNull: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        showinindex: { type: Sequelize.INTEGER, defaultValue: 0 },
        fueltype: { type: Sequelize.STRING, allowNull: true },
        fuelcapacity: { type: Sequelize.STRING, allowNull: true },
        image1: { type: Sequelize.STRING, allowNull: true },
        image2: { type: Sequelize.STRING, allowNull: true },
        image3: { type: Sequelize.STRING, allowNull: true },
        image4: { type: Sequelize.STRING, allowNull: true },
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