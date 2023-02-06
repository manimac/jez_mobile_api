const TermsAndCondtionModel = (sequelize, Sequelize) => {
    const TermsAndCondtion = sequelize.define('TermsAndCondtion', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        content: { type: Sequelize.TEXT, allowNull: true }
    })

    return TermsAndCondtion
}

module.exports = TermsAndCondtionModel