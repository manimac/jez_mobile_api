const WithdrawrequestModel = (sequelize, Sequelize) => {
    const Withdrawrequest = sequelize.define('Withdrawrequest', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        requestdate: { type: Sequelize.DATE, allowNull: true },
        amount: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 } //1- Success, 2 - failure, 3-In Progress
    })

    return Withdrawrequest
}

module.exports = WithdrawrequestModel