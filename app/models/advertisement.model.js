
const AdvertisementModel = (sequelize, Sequelize) => {
    const Advertisement = sequelize.define('Advertisement', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: Sequelize.STRING, allowNull: true },
        image: { type: Sequelize.TEXT, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
      path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/home/`
            }
        }
    })

    return Advertisement
}

module.exports = AdvertisementModel