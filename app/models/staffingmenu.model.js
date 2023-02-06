
const StaffingMenuModel = (sequelize, Sequelize) => {
    const StaffingMenu = sequelize.define('StaffingMenu', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return StaffingMenu
}

module.exports = StaffingMenuModel