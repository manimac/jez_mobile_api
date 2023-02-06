const VehicleModel = (sequelize, Sequelize) => {
    const Vehicle = sequelize.define('Vehicle', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        route: { type: Sequelize.STRING, allowNull: true },
        priceperhr: { type: Sequelize.STRING, allowNull: true },
        peekpriceperhr: { type: Sequelize.STRING, allowNull: true },
        cc: { type: Sequelize.STRING, allowNull: true },
        kmpl: { type: Sequelize.STRING, allowNull: true },
        seats: { type: Sequelize.STRING, allowNull: true },
        datum1eregistratie: { type: Sequelize.STRING, allowNull: true },
        vermogen: { type: Sequelize.STRING, allowNull: true },
        kilometerstand: { type: Sequelize.STRING, allowNull: true },
        bouwjaar: { type: Sequelize.STRING, allowNull: true },
        carrosserie: { type: Sequelize.STRING, allowNull: true },
        kenteken: { type: Sequelize.STRING, allowNull: true },
        steeringtype: { type: Sequelize.STRING, allowNull: true },
        merk: { type: Sequelize.STRING, allowNull: true },
        alloywheelsize: { type: Sequelize.STRING, allowNull: true },
        aantalcilinders: { type: Sequelize.STRING, allowNull: true },
        vermogenkw: { type: Sequelize.STRING, allowNull: true },
        vermogenpk: { type: Sequelize.STRING, allowNull: true },
        kleur: { type: Sequelize.STRING, allowNull: true },
        aantaldeuren: { type: Sequelize.STRING, allowNull: true },
        aantalzitplaatsen: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        showinindex: { type: Sequelize.INTEGER, defaultValue: 0 },
    })

    return Vehicle
}

module.exports = VehicleModel