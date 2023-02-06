
const VehicleimageModel = (sequelize, Sequelize) => {
    const Vehicleimage = sequelize.define('Vehicleimage', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        image: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/vehicle/`
            }
        }
    })

    return Vehicleimage
}

module.exports = VehicleimageModel