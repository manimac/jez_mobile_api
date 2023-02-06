const TeamModel = (sequelize, Sequelize) => {
    const Team = sequelize.define('Team', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        isowner: { type: Sequelize.BOOLEAN, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 } //1- Success, 2 - failure, 3-In Progress
    })

    return Team
}

module.exports = TeamModel