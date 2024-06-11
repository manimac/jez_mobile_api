const EmployeeModel = (sequelize, Sequelize) => {
    const Employee = sequelize.define('Employee', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        firstname: { type: Sequelize.STRING, allowNull: true },
        lastname: { type: Sequelize.STRING, allowNull: true },
        phone: { type: Sequelize.STRING, allowNull: true },
        assignment: { type: Sequelize.STRING, allowNull: true },
        address: { type: Sequelize.STRING, allowNull: true },
        street: { type: Sequelize.STRING, allowNull: true },
        country: { type: Sequelize.STRING, allowNull: true },
        postcode: { type: Sequelize.STRING, allowNull: true },
        btw: { type: Sequelize.STRING, allowNull: true },
        bsn: { type: Sequelize.STRING, allowNull: true },
        profileimage: { type: Sequelize.STRING, allowNull: true },
        step: { type: Sequelize.STRING, allowNull: true },
        skipstep: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: true },
    })

    return Employee
}

module.exports = EmployeeModel