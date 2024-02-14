const staffOrTransportInterestModel = (sequelize, Sequelize) => {
    const staffOrTransportInterest = sequelize.define('staffOrTransportInterest', {
        notified: { type: Sequelize.INTEGER, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return staffOrTransportInterest
}

module.exports = staffOrTransportInterestModel

// Reference
/*
employee_id
staffortransportreqeust_id
*/
