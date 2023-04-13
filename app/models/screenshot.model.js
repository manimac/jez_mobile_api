const screenshootModel = (sequelize, Sequelize) => {
    const screenshoot = sequelize.define('screenshoot', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        initialimage1: { type: Sequelize.STRING, allowNull: true },
        initialimage2: { type: Sequelize.STRING, allowNull: true },
        initialimage3: { type: Sequelize.STRING, allowNull: true },
        initialimage4: { type: Sequelize.STRING, allowNull: true },
        completedimage1: { type: Sequelize.STRING, allowNull: true },
        completedimage2: { type: Sequelize.STRING, allowNull: true },
        completedimage3: { type: Sequelize.STRING, allowNull: true },
        completedimage4: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/screenshot/`
            }
        }
    })

    return screenshoot
}

module.exports = screenshootModel