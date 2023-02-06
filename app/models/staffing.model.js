const StaffingModel = (sequelize, Sequelize) => {
    const Staffing = sequelize.define('Staffing', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        route: { type: Sequelize.STRING, allowNull: true },
        photo: { type: Sequelize.STRING, allowNull: true },
        voornaam: { type: Sequelize.STRING, allowNull: true },
        achternaam: { type: Sequelize.STRING, allowNull: true },
        geboortedatum: { type: Sequelize.STRING, allowNull: true },
        nationaliteit: { type: Sequelize.STRING, allowNull: true },
        rijbewijs: { type: Sequelize.STRING, allowNull: true },
        beschikbaarvoordefunctie: { type: Sequelize.STRING, allowNull: true },
        werkervaring: { type: Sequelize.TEXT, allowNull: true },
        opleiding: { type: Sequelize.STRING, allowNull: true },
        talen: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        showinindex: { type: Sequelize.INTEGER, defaultValue: 0 },
        priceperhr: { type: Sequelize.FLOAT, allowNull: true },
        peekpriceperhr: { type: Sequelize.FLOAT, allowNull: true },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/staffing/`
            }
        }
    })

    return Staffing
}

module.exports = StaffingModel