
const request = require('request');
const appUtil = require('../apputil');

exports.deviceList = function (req, res) {
    let qString = `?query=in nulla&active=true&limit=20&offset=0&sort=serial_number,erp_delivery_number`;
    let headers = { 'X-CloudBoxx-ApiKey': 'dSAqwwfQL6qSfmkYS0X2FDjPxyZC7ZjnQ4rxGHpDpGH27Lt8mWD6JpnSeUOIR10F', 'Accept': `application/json` };
    const cOptions = {
        url: 'https://api.cloudboxx.invers.com/api/devices',
        method: 'GET',
        headers: headers
    };
    request(cOptions, function (err, resp) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else
            res.send(resp);
    });
}

exports.getStatus = function (req, res) {
    let qString = `?query=in nulla&active=true&limit=20&offset=0&sort=serial_number,erp_delivery_number`;
    let headers = { 'X-CloudBoxx-ApiKey': 'dSAqwwfQL6qSfmkYS0X2FDjPxyZC7ZjnQ4rxGHpDpGH27Lt8mWD6JpnSeUOIR10F', 'Accept': `application/json` };
    const cOptions = {
        url: 'https://api.cloudboxx.invers.com/api/devices/' + `${req.body.qnr}` + '/status?fallback=true',
        method: 'GET',
        headers: headers
    };
    request(cOptions, function (err, resp) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else
            res.send(resp);
    });
}

exports.lockUnlock = function (req, res) {
    let qString = `/${req.body.qnr}/central-lock?fallback=true`;
    let headers = { 'X-CloudBoxx-ApiKey': 'dSAqwwfQL6qSfmkYS0X2FDjPxyZC7ZjnQ4rxGHpDpGH27Lt8mWD6JpnSeUOIR10F', 'Accept': `application/json` };
    const cOptions = {
        url: 'https://api.cloudboxx.invers.com/api/devices/' + `${req.body.qnr}` + '/central-lock?fallback=true',
        method: 'PUT',
        headers: headers,
        body: {
            // add the data you want to send here
            state: req.body.state,    // locked / unlocked

        },
        json: true
    };
    request(cOptions, function (err, resp) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            const cOptions = {
                url: 'https://api.cloudboxx.invers.com/api/devices/' + `${req.body.qnr}` + '/immobilizer?fallback=true',
                method: 'PUT',
                headers: headers,
                body: {
                    // add the data you want to send here
                    state: req.body.state,    // locked / unlocked

                },
                json: true
            };
            request(cOptions, function (err, resp) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                } else {
                    res.send(resp);
                }
            });
        }
    });
}

exports.getDeliveryCharge = function (req, res) {
    const options = {
        url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
        method: 'POST',
        headers: {
            // 'Authorization': 'key=AAAAo_99WdY:APA91bG7SVOhch85rxxWHnfeSZwjOW3ccreU8JwAiQEdRLehkbdPjQbtghXvsta5q08btPgrntd4KDjmvACTsYjpXi4lLtAZqW-pIJ4vUx2754LAlux8tRKWPlhhqIko0y0utgchtdAE',
            'Content-Type': 'application/json'
        },
        json: {
            email: 'info@hjrtools.com',
            password: 'Hjr@5253'
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            let qString = `?pickup_postcode=${req.body.pickup_postcode}&delivery_postcode=${req.body.delivery_postcode}&weight=${req.body.weight}&cod=0`;
            let headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${response.body.token}` };
            const cOptions = {
                url: 'https://apiv2.shiprocket.in/v1/external/courier/serviceability/' + qString,
                method: 'GET',
                headers: headers
            };
            request(cOptions, function (err, resp) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                } else
                    res.json({ token: response.body.token, data: resp.body })
            });
        } else {
            console.log(error);
            res.status(500).send(error);
        }
    }
    request(options, callback);
}
