const EmployerUserModel = (sequelize, Sequelize) => {
    const EmployerUser = sequelize.define('EmployerUser', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        companylogo: { type: Sequelize.STRING, allowNull: true },
        coverphoto: { type: Sequelize.STRING, allowNull: true },
        companyname: { type: Sequelize.STRING, allowNull: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        website: { type: Sequelize.STRING, allowNull: true },
        kvk: { type: Sequelize.STRING, allowNull: true },
        btw: { type: Sequelize.STRING, allowNull: true },
        phone: { type: Sequelize.STRING, allowNull: true },
        email: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
        password: { type: Sequelize.STRING(1255) },
        status: { type: Sequelize.INTEGER, defaultValue: 0 },
        is_verified: { type: Sequelize.BOOLEAN, defaultValue: 0 },
        reset_password: { type: Sequelize.BOOLEAN, defaultValue: 1 },
        verification_token: { type: Sequelize.STRING(1255), allowNull: true },
        role: { type: Sequelize.STRING, allowNull: true },
        otp: { type: Sequelize.STRING, defaultValue: 0 },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/employer/`
            }
        },
        fullname: {
            type: Sequelize.VIRTUAL,
            get() {
                return this.firstname + ' ' + (this.lastname || '')
            }
        }
    })
    return EmployerUser
}

module.exports = EmployerUserModel