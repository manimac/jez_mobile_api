const staffOrTransportWorkingHistory = (sequelize, Sequelize) => {
    const staffOrTransportWorking = sequelize.define('staffOrTransportWorkingHistory', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: Sequelize.STRING, allowNull: true },
        hoursWorked: { type: Sequelize.STRING, allowNull: true },
        breakhours: { type: Sequelize.STRING, allowNull: true },
        comments: { type: Sequelize.STRING, allowNull: true },
    })

    return staffOrTransportWorking
}

module.exports = staffOrTransportWorkingHistory