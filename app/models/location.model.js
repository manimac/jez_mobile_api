const LocationModel = (sequelize, Sequelize) => {
    const Location = sequelize.define('Location', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        content: { type: Sequelize.TEXT, allowNull: true },
        iframes: { type: Sequelize.TEXT, allowNull: true },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/home/`
            }
        }
    })

    return Location
}

module.exports = LocationModel