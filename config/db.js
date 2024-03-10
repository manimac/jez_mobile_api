module.exports = {
    config: {
        // host: '127.0.0.1',
        // host: 'capricorn.premium.hostns.io',
        host: 'master.jezselhosting.net',
        port: '3306',
        database: 'jezselnl_mobileapp',
        user: 'jezselnl_mobileapp',
        password: 'jezselnl_mobileapp',
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