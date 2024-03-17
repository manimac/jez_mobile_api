const moment = require('moment');
const OrderhistoryModel = (sequelize, Sequelize) => {
    const Orderhistory = sequelize.define('Orderhistory', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        type: { type: Sequelize.STRING, allowNull: true },
        name: { type: Sequelize.STRING, allowNull: true },
        checkindate: { type: 'Timestamp', allowNull: true },
        checkintime: { type: Sequelize.TIME, allowNull: true },
        checkoutdate: { type: 'Timestamp', allowNull: true },
        originalcheckoutdate: { type: 'Timestamp', allowNull: true },
        checkouttime: { type: Sequelize.TIME, allowNull: true },
        originalcheckouttime: { type: Sequelize.TIME, allowNull: true },
        price: { type: Sequelize.STRING, allowNull: true },
        discount: { type: Sequelize.STRING, allowNull: true },
        advancepaid: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        maxcanceldate: { type: 'Timestamp', allowNull: true },
        canceleddate: { type: Sequelize.DATE, allowNull: true },
        cancelationfee: { type: Sequelize.STRING, allowNull: true },
        maxcheckoutdateutc: { type: Sequelize.DATE, allowNull: true },
        mail: { type: Sequelize.BOOLEAN, allowNull: true },
        invoiceid: { type: Sequelize.STRING, allowNull: true },
        invoice: { type: Sequelize.BOOLEAN, allowNull: true },
        endbooking: { type: Sequelize.BOOLEAN, allowNull: true },
        endbookingtime: { type: 'Timestamp', allowNull: true },
        screenshotupdated: { type: Sequelize.INTEGER, defaultValue: 0 },
        beforeemail: { type: Sequelize.INTEGER, defaultValue: 0 },
        currentemail: { type: Sequelize.INTEGER, defaultValue: 0 },
        futureemail: { type: Sequelize.INTEGER, defaultValue: 0 },
        created: { type: Sequelize.STRING, allowNull: true },
        isreaded: { type: Sequelize.BOOLEAN, allowNull: true },
        minutes_diff: {
            type: Sequelize.VIRTUAL,
            get() {
                let end = moment(this.checkoutdate);
                let start = moment(this.checkindate);
                var duration = moment.duration(end.diff(start));
                return duration.asMinutes();
            }
        }
    })

    return Orderhistory
}

module.exports = OrderhistoryModel