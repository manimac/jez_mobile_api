
const FaqModel = (sequelize, Sequelize) => {
    const Faq = sequelize.define('Faq', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: Sequelize.STRING, allowNull: true },
        content: { type: Sequelize.TEXT, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return Faq
}

module.exports = FaqModel