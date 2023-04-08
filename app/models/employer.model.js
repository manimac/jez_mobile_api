const EmployerModel = (sequelize, Sequelize) => {
    const Employer = sequelize.define('Employer', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        companylogo: { type: Sequelize.STRING, allowNull: true },
        coverphoto: { type: Sequelize.STRING, allowNull: true },
        companyname: { type: Sequelize.STRING, allowNull: true },
        email: { type: Sequelize.STRING, allowNull: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        website: { type: Sequelize.STRING, allowNull: true },
        kvk: { type: Sequelize.STRING, allowNull: true },
        btw: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return Employer
}

module.exports = EmployerModel