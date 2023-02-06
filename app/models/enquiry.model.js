const EnquiryModel = (sequelize, Sequelize) => {
    const Enquiry = sequelize.define('Enquiry', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        email: { type: Sequelize.STRING, allowNull: true },
        phone: { type: Sequelize.STRING, allowNull: true },
        subject: { type: Sequelize.STRING, allowNull: true },
        message: { type: Sequelize.TEXT, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return Enquiry
}

module.exports = EnquiryModel