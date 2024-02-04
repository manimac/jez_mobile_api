const UserapplicantModel = (sequelize, Sequelize) => {
    const Userapplicant = sequelize.define('Userapplicant', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        applicantId: { type: Sequelize.STRING, allowNull: true },
    })

    return Userapplicant
}

module.exports = UserapplicantModel