// var Sequelize = require('sequelize');
// let commomFields = require('./commonfields');
// let localFields = {
//     id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
//     logo: { type: Sequelize.STRING, allowNull: false },
//     mail: { type: Sequelize.STRING, allowNull: false },
//     phone: { type: Sequelize.STRING, allowNull: false },
//     status: { type: Sequelize.INTEGER, defaultValue: 1 },
// }
// fields = {...localFields,...commomFields };

const HomeModel = (sequelize, Sequelize) => {
    const Home = sequelize.define('Home', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        logo: { type: Sequelize.STRING, allowNull: false },
        mail: { type: Sequelize.STRING, allowNull: false },
        phone: { type: Sequelize.STRING, allowNull: false },
        peekvehicle: { type: Sequelize.FLOAT, allowNull: false },
        peekstaffing: { type: Sequelize.FLOAT, allowNull: false },
        peektransport: { type: Sequelize.FLOAT, allowNull: false },
        copyright: { type: Sequelize.STRING, allowNull: false },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/home/`
            }
        }
    })

    return Home
}

module.exports = HomeModel