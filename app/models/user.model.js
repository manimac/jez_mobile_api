const UserModel = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        phone: { type: Sequelize.STRING, allowNull: true },
        countrycode: { type: Sequelize.STRING, allowNull: true },
        firstname: { type: Sequelize.STRING, allowNull: true },
        lastname: { type: Sequelize.STRING, allowNull: true },
        insertion: { type: Sequelize.STRING, allowNull: true },
        email: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
        password: { type: Sequelize.STRING(1255) },
        userimage: { type: Sequelize.STRING(1255), allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        is_verified: { type: Sequelize.BOOLEAN, defaultValue: 0 },
        is_admin: { type: Sequelize.BOOLEAN, defaultValue: 0 },
        is_id_verified: { type: Sequelize.BOOLEAN, defaultValue: 0 },
        newsletter: { type: Sequelize.BOOLEAN, defaultValue: 0 },
        termsandcondition: { type: Sequelize.BOOLEAN, defaultValue: 0 },
        is_favorite: { type: Sequelize.BOOLEAN, defaultValue: 0 },
        reset_password: { type: Sequelize.BOOLEAN, defaultValue: 1 },
        verification_token: { type: Sequelize.STRING(1255), allowNull: true },
        role: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: true },
        kvk: { type: Sequelize.STRING, allowNull: true },
        btwnr: { type: Sequelize.STRING, allowNull: true },
        vesigingstraat: { type: Sequelize.STRING, allowNull: true },
        vesiginghuisnr: { type: Sequelize.STRING, allowNull: true },
        vesigingpostcode: { type: Sequelize.STRING, allowNull: true },
        vesigingplaats: { type: Sequelize.STRING, allowNull: true },
        vesigingland: { type: Sequelize.STRING, allowNull: true },
        factuurstraat: { type: Sequelize.STRING, allowNull: true },
        factuurhuisnr: { type: Sequelize.STRING, allowNull: true },
        factuurpostcode: { type: Sequelize.STRING, allowNull: true },
        factuurplaats: { type: Sequelize.STRING, allowNull: true },
        factuurland: { type: Sequelize.STRING, allowNull: true },
        aanhef: { type: Sequelize.STRING, allowNull: true },
        voornaam: { type: Sequelize.STRING, allowNull: true },
        tussenvoegsel: { type: Sequelize.STRING, allowNull: true },
        achternaam: { type: Sequelize.STRING, allowNull: true },
        factuuremail: { type: Sequelize.STRING, allowNull: true },
        telefoonnr: { type: Sequelize.STRING, allowNull: true },
        bedrijfsnaam: { type: Sequelize.STRING, allowNull: true },
        wallet: { type: Sequelize.STRING, allowNull: true },
        interestused: { type: Sequelize.STRING, allowNull: true },
        teamowner: { type: Sequelize.BOOLEAN, defaultValue: 0 },
        otp: { type: Sequelize.STRING, defaultValue: 0 },
        deviceId: { type: Sequelize.STRING,allowNull: true  },
        btw: { type: Sequelize.STRING, allowNull: true },
        bsn: { type: Sequelize.STRING, allowNull: true },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/user/`
            }
        },
        fullname: {
            type: Sequelize.VIRTUAL,
            get() {
                return this.firstname +' '+ (this.lastname || '')
            }
        }
    })
    return User
}

module.exports = UserModel