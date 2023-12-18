const staffOrTransportRequest = (sequelize, Sequelize) => {
    const employeerequest = sequelize.define('staffOrTransportRequest', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        type: { type: Sequelize.STRING, allowNull: true },
        title: { type: Sequelize.STRING, allowNull: true },
        description: { type: Sequelize.STRING, allowNull: true },
        industry: { type: Sequelize.STRING, allowNull: true },
        function: { type: Sequelize.STRING, allowNull: true },
        cancelperiod: { type: Sequelize.STRING, allowNull: true },
        workstartdate: { type: Sequelize.STRING, allowNull: true },
        workenddate: { type: Sequelize.STRING, allowNull: true },
        worktime: { type: Sequelize.STRING, allowNull: true },
        rate: { type: Sequelize.STRING, allowNull: true },
        worktype: { type: Sequelize.STRING, allowNull: true }, // 10.	Freelancers / Temporary worker
        location: { type: Sequelize.STRING, allowNull: true }, 
        contact: { type: Sequelize.STRING, allowNull: true }, 
        from: { type: Sequelize.STRING, allowNull: true }, 
        fromtime: { type: Sequelize.STRING, allowNull: true }, 
        to: { type: Sequelize.STRING, allowNull: true }, 
        totime: { type: Sequelize.STRING, allowNull: true }, 
        loadingdate: { type: Sequelize.STRING, allowNull: true }, 
        unloadingdate: { type: Sequelize.STRING, allowNull: true }, 
        typeofgoods: { type: Sequelize.STRING, allowNull: true },
        weight: { type: Sequelize.STRING, allowNull: true },
        length: { type: Sequelize.STRING, allowNull: true },
        vechicletype: { type: Sequelize.STRING, allowNull: true },
        packaging: { type: Sequelize.STRING, allowNull: true },
        certificate: { type: Sequelize.STRING, allowNull: true },
        equipment: { type: Sequelize.STRING, allowNull: true },
        timecontroller: { type: Sequelize.STRING, allowNull: true },
        staffneeded: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        image: { type: Sequelize.STRING, allowNull: true },
        path: {
            type: Sequelize.VIRTUAL,
            get() {
                return `${process.env.baseUrl}uploads/employer/`
            }
        }
    })

    return employeerequest
}

module.exports = staffOrTransportRequest