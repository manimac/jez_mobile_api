const staffOrTransportWorkingHistory = (sequelize, Sequelize) => {
    const staffOrTransportWorking = sequelize.define('staffOrTransportWorkingHistory', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: Sequelize.STRING, allowNull: true },
        hoursWorked: { type: Sequelize.STRING, allowNull: true },
        breakhours: { type: Sequelize.STRING, allowNull: true },
        comments: { type: Sequelize.STRING, allowNull: true },
        starttime: { type: Sequelize.STRING, allowNull: true },
        endtime: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 0 },
    })

    return staffOrTransportWorking
}

module.exports = staffOrTransportWorkingHistory