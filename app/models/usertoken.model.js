const UserTokenModel = (sequelize, Sequelize) => {
    const UserToken = sequelize.define('Usertoken', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        token: { type: Sequelize.STRING, allowNull: true }
    })
    return UserToken
}

module.exports = UserTokenModel