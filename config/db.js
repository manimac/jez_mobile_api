module.exports = {
    config: {
        // host: '127.0.0.1',
        host: 'uranium.da.hostns.io',
        port: '3306',
        database: 'jezsel_test',
        user: 'jezsel_test',
        password: 'jezsel_test',
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }

    // config: {
    //     // host: '127.0.0.1',
    //     host: '23.234.237.154',
    //     port: '3306',
    //     database: 'serverboot_jezsel',
    //     user: 'serverboot_jezsel',
    //     password: 'jezsel@2021',
    //     dialect: "mysql",
    //     pool: {
    //         max: 5,
    //         min: 0,
    //         acquire: 30000,
    //         idle: 10000
    //     }
    // }
}