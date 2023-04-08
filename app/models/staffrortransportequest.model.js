const staffOrTransportRequest = (sequelize, Sequelize) => {
    const employeerequest = sequelize.define('staffOrTransportRequest', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        type: { type: Sequelize.STRING, allowNull: true },
        title: { type: Sequelize.STRING, allowNull: true },
        description: { type: Sequelize.STRING, allowNull: true },
        industry: { type: Sequelize.STRING, allowNull: true },
        industry: { type: Sequelize.STRING, allowNull: true },
        cancelperiod: { type: Sequelize.STRING, allowNull: true },
        workdate: { type: 'Timestamp', allowNull: true },
        worktime: { type: Sequelize.STRING, allowNull: true },
        rate: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: true }, // 10.	Freelancers / Temporary worker
        location: { type: Sequelize.STRING, allowNull: true }, 
        contact: { type: Sequelize.STRING, allowNull: true }, 
        from: { type: Sequelize.STRING, allowNull: true }, 
        to: { type: Sequelize.STRING, allowNull: true }, 
        loadingdate: { type: 'Timestamp', allowNull: true }, 
        unloadingdate: { type: 'Timestamp', allowNull: true }, 
        typeofgoods: { type: Sequelize.STRING, allowNull: true },
        weight: { type: Sequelize.STRING, allowNull: true },
        length: { type: Sequelize.STRING, allowNull: true },
        vechicletype: { type: Sequelize.STRING, allowNull: true },
        packaging: { type: Sequelize.STRING, allowNull: true },
        certificate: { type: Sequelize.STRING, allowNull: true },
        equipment: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
    })

    return employeerequest
}

module.exports = staffOrTransportRequest