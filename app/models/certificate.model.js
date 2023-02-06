const CertificateModel = (sequelize, Sequelize) => {
    const Certificate = sequelize.define('Certificate', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: Sequelize.TEXT, allowNull: true },
        content: { type: Sequelize.TEXT, allowNull: true }
    })

    return Certificate
}

module.exports = CertificateModel