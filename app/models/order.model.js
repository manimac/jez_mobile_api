const moment = require('moment');
const OrderModel = (sequelize, Sequelize) => {
    const Order = sequelize.define('Order', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        ordernumber: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: true },
        kvk: { type: Sequelize.STRING, allowNull: true },
        btwnr: { type: Sequelize.STRING, allowNull: true },
        vesigingstraat: { type: Sequelize.STRING, allowNull: true },
        vesiginghuisnr: { type: Sequelize.STRING, allowNull: true },
        vesigingpostcode: { type: Sequelize.STRING, allowNull: true },
        vesigingplaats: { type: Sequelize.STRING, allowNull: true },
        vesigingland: { type: Sequelize.STRING, allowNull: true },
        factuurstraat: { type: Sequelize.STRING, allowNull: true },
        factuurhuisnr: { type: Sequelize.STRING, allowNull: true },
        factuurpostcode: { type: Sequelize.STRING, allowNull: true },
        factuurplaats: { type: Sequelize.STRING, allowNull: true },
        factuurland: { type: Sequelize.STRING, allowNull: true },
        aanhef: { type: Sequelize.STRING, allowNull: true },
        voornaam: { type: Sequelize.STRING, allowNull: true },
        tussenvoegsel: { type: Sequelize.STRING, allowNull: true },
        achternaam: { type: Sequelize.STRING, allowNull: true },
        factuuremail: { type: Sequelize.STRING, allowNull: true },
        telefoonnr: { type: Sequelize.STRING, allowNull: true },
        total: { type: Sequelize.FLOAT, allowNull: true },
        paymentchargeid: { type: Sequelize.STRING, allowNull: true },
        amountpaid: { type: Sequelize.STRING, allowNull: true },
        fromwallet: { type: Sequelize.BOOLEAN, allowNull: true },
        maxcheckoutdate: { type: Sequelize.DATE, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 }, //1- Success, 2 - failure, 3-In Progress
        driverFirstName: { type: Sequelize.STRING, allowNull: true },
        driverLastName: { type: Sequelize.STRING, allowNull: true },
        driverEmail: { type: Sequelize.STRING, allowNull: true },
        driverPhone: { type: Sequelize.STRING, allowNull: true },
        driverAddress: { type: Sequelize.STRING, allowNull: true },
      	paymentLinkstatus: { type: Sequelize.INTEGER, defaultValue: 1 },
      	driverlicense: { type: Sequelize.STRING, allowNull: true },
      	maxcheckoutdateutc: { type: Sequelize.DATE, allowNull: true },
        mail: { type: Sequelize.BOOLEAN, allowNull: true },
        isreaded: { type: Sequelize.BOOLEAN, allowNull: true },
        freebooking: { type: Sequelize.BOOLEAN, allowNull: true },
        intentid: { type: Sequelize.TEXT, allowNull: true }
    })

    return Order
}

module.exports = OrderModel