const ContactusModel = (sequelize, Sequelize) => {
    const Contactus = sequelize.define('Contactus', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        email: { type: Sequelize.STRING, allowNull: true },
        phone: { type: Sequelize.STRING, allowNull: true },
        address: { type: Sequelize.STRING, allowNull: true }
    })

    return Contactus
}

module.exports = ContactusModel