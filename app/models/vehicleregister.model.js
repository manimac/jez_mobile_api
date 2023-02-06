const moment = require('moment');
const VehicleRegisterModel = (sequelize, Sequelize) => {
    const VehicleRegister = sequelize.define('VehicleRegister', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        vancountry: { type: Sequelize.STRING, allowNull: true },
        vanplace: { type: Sequelize.STRING, allowNull: true },
        naarcountry: { type: Sequelize.STRING, allowNull: true },
        naarplace: { type: Sequelize.STRING, allowNull: true },
        vanafdatum: { type: Sequelize.DATE, allowNull: true },
        vanafdtijd: { type: Sequelize.TIME, allowNull: true },
        totenmetdatum: { type: Sequelize.DATE, allowNull: true },
        totenmetdtijd: { type: Sequelize.TIME, allowNull: true },
        contactparsonname: { type: Sequelize.STRING, allowNull: true },
        contactpersontelephone: { type: Sequelize.STRING, allowNull: true },
        contactpersonemail: { type: Sequelize.STRING, allowNull: true },
        vrachtwagen: { type: Sequelize.STRING, allowNull: true },
        uitrusting: { type: Sequelize.STRING, allowNull: true },
        gewicht: { type: Sequelize.STRING, allowNull: true },
        length: { type: Sequelize.STRING, allowNull: true },
        certificaat: { type: Sequelize.STRING, allowNull: true },
        comment: { type: Sequelize.STRING, allowNull: true },
        paymentchargeid: { type: Sequelize.STRING, allowNull: true },
        amount: { type: Sequelize.FLOAT, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        interestamount: {
            type: Sequelize.VIRTUAL,
            get() {
                if (this.status == 1) {
                    let current = moment();
                    let createdAt = this.getDataValue('createdAt');
                    let noOfMonths = current.diff(createdAt, 'months');
                    let intAmount = 0;
                    if (noOfMonths >= 1) {
                        intPercentage = noOfMonths * 0.39;
                        intAmount = (this.getDataValue('amount') * intPercentage) / 100
                    }
                    return intAmount;
                }
            }
        }
    })

    return VehicleRegister
}

module.exports = VehicleRegisterModel