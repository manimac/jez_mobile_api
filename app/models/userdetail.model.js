const UserDetailModel = (sequelize, Sequelize) => {
    const UserDetail = sequelize.define('UserDetail', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        designation: { type: Sequelize.STRING, allowNull: true },
        subject: { type: Sequelize.STRING, allowNull: true },
        qualification: { type: Sequelize.STRING, allowNull: true },
        coursename: { type: Sequelize.STRING, allowNull: true },
        gender: { type: Sequelize.STRING, allowNull: true },
        bloodgroup: { type: Sequelize.STRING, allowNull: true },
        mobilenumber: { type: Sequelize.STRING, allowNull: true },
        aadharno: { type: Sequelize.STRING, allowNull: true },
        dateofjoingovt: { type: Sequelize.DATEONLY },
        dateofjoin: { type: Sequelize.DATEONLY },
        instutionname: { type: Sequelize.STRING, allowNull: true },
        address1: { type: Sequelize.STRING, allowNull: true },
        address2: { type: Sequelize.STRING, allowNull: true },
        pincode: { type: Sequelize.STRING, allowNull: true },
        level: { type: Sequelize.STRING, allowNull: true },
        contactnumber: { type: Sequelize.STRING, allowNull: true },
        instutionemailid: { type: Sequelize.STRING, allowNull: true },
        principalname: { type: Sequelize.STRING, allowNull: true },
        principalemailid: { type: Sequelize.STRING, allowNull: true },
        principalmobile: { type: Sequelize.STRING, allowNull: true },
        dateofbirth: { type: Sequelize.DATEONLY },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        achivements: { type: Sequelize.STRING, allowNull: true },
        awards: { type: Sequelize.STRING, allowNull: true },
        recognition: { type: Sequelize.STRING, allowNull: true },
        other: { type: Sequelize.STRING, allowNull: true },
    })
    return UserDetail
}

module.exports = UserDetailModel