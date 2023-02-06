const AboutModel = (sequelize, Sequelize) => {
    const About = sequelize.define('About', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        content: { type: Sequelize.TEXT, allowNull: true }
    })

    return About
}

module.exports = AboutModel