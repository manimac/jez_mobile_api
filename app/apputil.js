const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const MODELS = require("./models");
const UserDetailModel = MODELS.userDetails;
const UserModel = MODELS.users;

const apiKey = '4de239d21a197cead36c21be9d305466';
const apiSecret = 'ad7ba52f89e6fc3eeab86cfe08baaf9e';
var smsglobal = require('smsglobal')(apiKey, apiSecret);
const stripe = require('stripe')('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');

var jwtSecret = 'tportalsecret';
exports.jwtSecret = jwtSecret;
const request = require('request');

var registerStatus = [
    { id: 1, value: "Registration" },
    { id: 2, value: "Appointment Fixed" },
    { id: 3, value: "Application Collected" },
    { id: 4, value: "Application Submitted" },
    { id: 5, value: "In Progress" },
    { id: 6, value: "Approved by Goverment" },
    { id: 7, value: "Licence updated" },
    { id: 0, value: "Application Rejected" },
];

var levelOfRecognition = [
    { "name": "National" },
    { "name": "State" },
    { "name": "District" },
    { "name": "Zonal" }
];
exports.levelOfRecognition = levelOfRecognition;

exports.makeUserDetail = function (body) {
    return new Promise(function (resolve, reject) {
        UserDetailModel.create(body).then(function (result) {
            resolve(result);
        }, function (err) {
            reject(err);
        })
    });
}
exports.updateUserDetail = function (body) {
    return new Promise(function (resolve, reject) {
        UserDetailModel.findOne({
            where: {
                user_id: body.user_id
            }
        }).then(function (resp) {
            resp.update(body).then(function (result) {
                resolve(result);
            }, function (err) {
                reject(err);
            })
        }, function (err) {
            reject(err);
        })

    });
}
// Mail configs
var readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

// var transporter = nodemailer.createTransport({
//     // host: 'mail.serverboot.in',
//     host: 'fiber4.iaasdns.com',
//     port: 587,
//     auth: {
//         user: "support1@jezsel.nl",
//         pass: "A$+#Vg!ICI"
//     },
//     tls: { rejectUnauthorized: false },
//     // tls: true,
// });

var transporter = nodemailer.createTransport({
    host: 'smtp.transip.email',
    port: 587,
    auth: {
        user: "support@jezsel.nl",
        pass: "Jez+28=Sel1983"
    },
    tls: { rejectUnauthorized: false },
    // host: 'uranium.da.hostns.io',
    // port: 587,
    // auth: {
    //     user: "test@jezsel.nl",
    //     pass: "test@123"
    // },
    // tls: { rejectUnauthorized: false },
});

exports.getUser = function (token) {
    let decoded = {};
    try {
        decoded = jwt.verify(token, jwtSecret);
        return decoded;
    } catch (e) {
        console.log(e);
    }
    return decoded;
}

exports.makeRandomText = function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/** Verification mail */
exports.sendVerificationMail = function (user, password = null) {
    sendVfMail(user, password).catch(console.error);
}
async function sendVfMail(user, password = null) {
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        let verifyUrl = `${process.env.baseUrl}user/verification/${user.id}/${user.verification_token}`;
        // let comments = `Click the following link to verify your JEZSEL account ${verifyUrl}`;
        let comments = `Welkom bij Jezsel. U heeft succesvol een account bij Jezsel.nl aangemaakt. Klikt u op de link om uw e-mailadres te bevestigen.</p><p>Mocht u geen account hebben aangemaakt, stuur dan een e-mail naar info@jezsel.nl</p><p>
        ${verifyUrl}</p><p>Wij wensen u nog veel plezier met de diensten van Jezsel.`;
        var replacements = {
            username: user.firstname ? user.firstname : '' + ' ' + user.lastname ? user.lastname : '',
            message: comments,
            message2: '',
        };
        if (password) {
            replacements.message2 = `Your Temporary password: ${password}`;
        }
        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: 'Uw registratie bij Jezsel.nl - verificatie mail', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}
/** End of Verification mail */

/** order Confirmation */

exports.sendOrderConfirmationMail = function (order, type) {
    sendOrdConfirmation(order, type).catch(console.error);
    sendOrdConfirmationAdmin(order, type).catch(console.error);
}
async function sendOrdConfirmation(order, type) {
    let user = order && order.user || {};
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        let comments = `Bedankt voor uw bezoek aan Jezsel.nl. Wij hebben uw aanvraag in goede orde ontvangen. Uw ordernummer is ` + order.id + ".</p><p>" + `Heeft u nog vragen naar aanleiding van dit bericht. Dan kunt u contact met ons opnemen per e-mail. Vergeet niet uw ordernummer te vermelden.</p><p>Wij wensen u alvast een fijne ervaring met onze diensten.`;
        var replacements = {
            username: user.firstname ? user.firstname : '' + ' ' + user.lastname ? user.lastname : '',
            message: comments,
            message2: '',
        };
        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: (type && type == 'wallet') ? 'JEZSEL - Bevestiging opwaardering' : 'JEZSEL Bevestiging boeking', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

async function sendOrdConfirmationAdmin(order, type) {
    let user = order && order.user || {};
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        let comments = `We have received a new order. Kindly check the admin panel. Order id - ` + order.id;
        var replacements = {
            username: "Admin",
            message: comments,
            message2: '',
        };
        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: ['orders@jezsel.nl'], // list of receivers
            subject: (type && type == 'wallet') ? 'JEZSEL - Bevestiging opwaardering' : 'JEZSEL New Order', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.sendPaymentLink = function (user) {
    main(user).catch(console.error);
}

// async..await is not allowed in global scope, must use a wrapper
async function main(user) {
    // // send mail with defined transport object
    // let verifyUrl = `https://serverboot.in/#/payment/${user.data}`;
    // let detail = {
    //     from: 'support1@jezsel.nl', // sender address
    //     to: user.email, // list of receivers
    //     subject: "JEZSEL Payment link", // Subject line
    //     text: "JEZSEL Payment link", // plain text body
    // }
    // detail.html = `<b>Good day! </b>`;
    // detail.html += `Please click below link to process the payment <br>`;
    // detail.html += `<a href='${verifyUrl}' target='_blank'>Proceed</a><br>Thanks <br> JEZSEL Team`;
    // let info = await transporter.sendMail(detail);
    // return info;
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        let verifyUrl = `${process.env.appUrl}payment?oud=${user.data}`;
        // let comments = `Click the following link to process the payment ${verifyUrl}`;
        let comments = `Bedankt voor uw bezoek aan onze website. U heeft ervoor gekozen om via een betalingslink te betalen. Via de onderstaande link kunt u betalen.</p><p>${verifyUrl}</p>Mocht u problemen ondervinden met de betalingslink, kunt u contact met ons opnemen.</p><p>Heeft u nog vragen naar aanleiding van dit bericht, kunt u ook contact met ons opnemen.`;
        var replacements = {
            username: user.firstname ? user.firstname : '' + ' ' + user.lastname ? user.lastname : '',
            message: comments,
            message2: '',
        };
        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: 'JEZSEL Betaallink', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return error;
            } else {
                return info;
            }
        })
    })
}

// exports.sendOTP = function (phone = null) {
//     return new Promise(function (resolve, reject) {
//         if (phone) {
//             var payload = {
//                 origin: 'MY ELOAH',
//                 message: '{*code*} is your MY ELOAH verification code.',
//                 destination: phone
//             };
//             // {*code*} placeholder is mandatory and will be replaced by an auto generated numeric code.
//             smsglobal.otp.send(payload, function (error, response) {
//                 if (response) {
//                     resolve(response)
//                     // verifyOTP();
//                 }
//                 if (error) {
//                     reject(error)
//                 }
//             });
//         } else {
//             reject(false);
//         }
//     })

// }

exports.verifyOTP = function (user, code) {
    return new Promise(function (resolve, reject) {
        var id = user.otprequestid; // requestId received upon sending an OTP
        smsglobal.otp.verifyByRequestId(id, code, function (error, response) {
            if (response) {
                resolve(response);
            }
            if (error) {
                reject(error);
            }
        });
    })
}

exports.resetedPassword = function (user, password) {
    return new Promise(async function (resolve, reject) {
        readHTMLFile('./app/mail/email-temp.html', function (err, html) {
            var template = handlebars.compile(html);
            let comments = `U heeft aangegeven uw wachtwoord te zijn vergeten van uw Jezsel account. U heeft succesvol uw wachtwoord gereset. Uw huidige wachtwoord is nu ${password}.</p><p>
            Mocht u geen verzoek hebben ingediend om uw wachtwoord te veranderen? Stuur dan een e-mail naar info@jezsel.nl.
            `;

            // message: `You have successfully reset the password for your JEZSEL account, Your current password is ${password}`,
            var replacements = {
                username: user.firstname ? user.firstname : '' + ' ' + user.lastname ? user.lastname : '',
                message: comments,
                message2: '',
            };


            var htmlToSend = template(replacements);
            let detail = {
                from: 'support@jezsel.nl', // sender address
                to: user.email, // list of receivers
                subject: 'JEZSEL Wachtwoord vergeten', // Subject li
                html: htmlToSend
            }

            transporter.sendMail(detail, function (error, info) {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        });
    });
}

exports.expireNotification = function (order, message) {
    let user = order.User
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        // let comments = `Your Service(` + order.id + `) going to expire in 1 Hour`;
        let comments = `Wij willen u graag aan herinneren dat het laatste uur van de overeengekomen huurperiode is aangebroken. Wij verzoeken u vriendelijk om het voertuig op tijd op de afgesproken locatie terug te brengen.</p><p>
        Graag maak ik u erop attent dat wanneer het gehuurde voertuig niet op tijd terug wordt gebracht €50,- euro per uur plus het huurtarief per uur naast de huursom zal worden gerekend.</p><p>
        Heeft u het gehuurde voertuig langer nodig dan u dacht? Dit is geen enkel probleem. Zolang het voertuig beschikbaar is, kun u het voertuig wederom reserveren op de website via uw eigen account.</p><p>
        Heeft u nog vragen naar aanleiding van dit bericht. Dan kunt u contact met ons opnemen.</p><p>
        Bedankt voor het gebruik maken van de diensten van Jezsel en graag tot ziens.
        `;
        var replacements = {
            username: user.firstname ? user.firstname : '' + ' ' + user.lastname ? user.lastname : '',
            message: comments,
            message2: '',
        };

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: message ? 'JEZSEL Nog één uur - '+ message : 'JEZSEL Nog één uur - Herinnering', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.expireNotificationAdmin= function (order) {
    let user = order.User
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        // let comments = `Your Service(` + order.id + `) going to expire in 1 Hour`;
        let comments = `Wij willen u graag aan herinneren dat het laatste uur van de overeengekomen huurperiode is aangebroken. Wij verzoeken u vriendelijk om het voertuig op tijd op de afgesproken locatie terug te brengen.</p><p>
        Graag maak ik u erop attent dat wanneer het gehuurde voertuig niet op tijd terug wordt gebracht €50,- euro per uur plus het huurtarief per uur naast de huursom zal worden gerekend.</p><p>
        Heeft u het gehuurde voertuig langer nodig dan u dacht? Dit is geen enkel probleem. Zolang het voertuig beschikbaar is, kun u het voertuig wederom reserveren op de website via uw eigen account.</p><p>
        Heeft u nog vragen naar aanleiding van dit bericht. Dan kunt u contact met ons opnemen.</p><p>
        Bedankt voor het gebruik maken van de diensten van Jezsel en graag tot ziens.
        `;
        var replacements = {
            username: "Admin",
            message: comments,
            message2: '',
        };

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: 'support@jezsel.nl', // list of receivers
            subject: 'JEZSEL Nog één uur - Herinnering', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.cancelNotification = function (user, order) {
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        let comments = `U heeft beroep gedaan op uw annuleringsverzekering.</p><p>Hierbij bevestigen wij dat uw annulering in goede orde is aangekomen.</p><p>Wij zien u graag terug bij Jezsel.`;
        var replacements = {
            username: user.firstname ? user.firstname : '' + ' ' + user.lastname ? user.lastname : '',
            message: comments,
            message2: '',
        };

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: 'JEZSEL Annulering', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.withdrawRequest = function (user, status) {
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        let comments = (status == 'Accepted') ? `U heeft een verzoek gedaan tot uitbetaling van uw wallet. Uw verzoek is goedgekeurd. Het bedrag zal binnen zeven werkdagen worden gestort op uw rekening.</p><p>Wij wensen u nog veel plezier met de diensten van Jezsel.` : `U heeft een verzoek gedaan tot uitbetaling van uw wallet. Uw verzoek is helaas afgekeurd. Binnen 3-5 werkdagen zal er contact met u worden opgenomen om de reden van afwijzing toe te lichten.</p><p>Mocht u nog vragen hebben naar aanleiding van dit bericht, verzoeken wij u vriendelijk om de vijf werkdagen te wachten en na de toelichting uw vraag te stellen. Op het moment dat u eerder contact opneemt, kunnen wij niet garanderen dat wij u verder kunnen helpen.</p><p>U kunt contact met ons opnemen per e-mail. Vergeet niet uw ordernummer te vermelden.`;
        var replacements = {
            username: user.firstname ? user.firstname : '' + ' ' + user.lastname ? user.lastname : '',
            message: comments,
            message2: '',
        };
        let subjectMdg = (status == 'Accepted') ? `JEZSEL Uitbetaling goedgekeurd` : `JEZSEL Uitbetaling afgekeurd`;

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: subjectMdg, // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.subscribeEmail = function (email) {
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        let comments = `We have a new Subscriber( ${email} ).`;
        var replacements = {
            username: 'Admin',
            message: comments,
            message2: '',
        };

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: 'orders@jezsel.nl', // list of receivers
            subject: 'JEZSEL New Subscription', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}


exports.sendInvoice = function (invoiceObj) {
    return new Promise(async function (resolve, reject) {
        let customer = await stripe.customers.create(invoiceObj.user);
        var customerId = customer.id;
        const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: 'send_invoice',
            days_until_due: 1,
            pending_invoice_items_behavior: "exclude"
        });

        const invoiceItem = await stripe.invoiceItems.create({
            customer: customerId,
            amount: parseFloat(invoiceObj.product.price),
            invoice: invoice.id,
            description: invoiceObj.product.description,
            tax_rates: ['txr_1MUlfuKmpImSnmCuAG7PLHhH']
        });
        await stripe.invoices.sendInvoice(invoice.id);
        resolve({ msg: invoice.id })
    });
}

/** App Login */
exports.appLogin = function (body) {
    return new Promise(function (resolve, reject) {
        const email = body.email;
        UserModel.findOne({
            where: {
                [Op.or]: [{ 'email': email }, { 'phone': email }],
            }
        }).then(async function (row) {
            if (row) {
                if(row.is_verified == 0){
                    resolve({
                        'message': 'Verifeer uw account om in te loggen', status: 204
                    });
                }
                else{
                    const otp = generateOTP();
                    await UserModel.update({ otp: otp }, {
                        where: {
                            id: row.id
                        }
                    });
                    if (body.isPhone) {
                        await sendOTPSMS(row, otp, body.countrycode);
                    } else {
                        await sendOTP(row, otp);
                    }
                    // await Promise.all([sendOTP(row, otp), sendOTPSMS(row, otp, body.countrycode)]);
    
                    resolve({
                        'message': 'OTP sent to user Email and SMS', status: 200
                    });
                }                
            } else {
                resolve({
                    'message': 'Please enter valid credentials', status: 204
                });
            }
        });
    })
}
/** OTP  */
async function sendOTP(userObj, otp) {
    try {
        const html = fs.readFileSync('./app/mail/email-temp.html', 'utf8');
        const template = handlebars.compile(html);
        const comments = `Jezsel logic OTP: ${otp}`;
        const replacements = {
            username: userObj.fullname,
            message: comments,
            message2: '',
        };

        const htmlToSend = template(replacements);

        const detail = {
            from: 'support@jezsel.nl',
            to: userObj.email,
            subject: 'JEZSEL Login OTP',
            html: htmlToSend
        };

        await transporter.sendMail(detail);
        return true;
    } catch (error) {
        console.error('Error sending OTP through email:', error);
        throw error;
    }
}

async function sendOTPSMS(userObj, otp, countrycode) {
    try {
        const headers = { 'Authorization': 'AccessKey 3z5juOZyiZoxMXbVKlN4A1hza2sWbdMKubwh', 'Accept': `application/json` };
        const cOptions = {
            url: 'https://api.bird.com/workspaces/24e482ef-9608-4080-bce9-888bd2362a7d/channels/52892b02-ca92-4fc0-a102-8636abdce013/messages',
            method: 'POST',
            headers: headers,
            json: true,
            body: {
                body: {
                    type: "text",
                    text: {
                        text: `${otp} is your one-time password (OTP) to login to JEZSEL. Please enter OTP to proceed`
                    }
                },
                receiver: {
                    contacts: [
                        {
                            identifierValue: countrycode + userObj.phone,
                            identifierKey: "phonenumber"
                        }
                    ]
                }
            }
        };

        await new Promise((resolve, reject) => {
            request(cOptions, function (err, resp) {
                if (err) {
                    console.error('Error sending OTP through SMS:', err);
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        });

        return true;
    } catch (error) {
        console.error('Error sending OTP through SMS:', error);
        throw error;
    }
}

function generateOTP() {
    let otp = "";
    const possibleChars = "0123456789";
    for (let i = 0; i < 6; i++) {
        const randomCharIndex = Math.floor(Math.random() * possibleChars.length);
        const randomChar = possibleChars.charAt(randomCharIndex);
        otp += randomChar;
    }
    return otp;
}

exports.hoursUpdate = function (user, status) {
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        let ms = '';
        if (status == 1) {
            ms = `Your hours rejected. Please verify and enter again`
        }
        else if (status == 2) {
            ms = `Your hours verified successfully`
        }
        let comments = (status == 0) ? `New hours updated for ` + user.firstname ? user.firstname : '' + ' ' + user.lastname ? user.lastname : '' : ms;
        var replacements = {
            username: (status == 0) ? 'Admin' : user.firstname ? user.firstname : '' + ' ' + user.lastname ? user.lastname : '',
            message: comments,
            message2: '',
        };
        let subjectMdg = (status == 0) ? `Hours updated` : `Hours verified`;

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: (status == 0) ? 'support@jezsel.nl' : user.email, // list of receivers
            subject: subjectMdg, // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.interestUpdate = function () {
    readHTMLFile('./app/mail/email-temp.html', function (err, html) {
        var template = handlebars.compile(html);
        let comments = `Your have new interest in your assignment`;
        var replacements = {
            username: 'Admin',
            message: comments,
            message2: '',
        };
        let subjectMdg = `New Interest`;

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'support@jezsel.nl', // sender address
            to: 'support@jezsel.nl', // list of receivers
            subject: subjectMdg, // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function (error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.sendmessage = function (body) {
    let headers = { 'Authorization': 'key=AAAAnG5n6m0:APA91bHvs4G6CpIV87WbzPwoh5hYqvgndQnxbaY_GDvoSzcHt82Jaqhp61s-9G1uGbNPIKJ9865D7kJS-kBjnQsETqTELvXR0W179sjMV8ev3UU_Cy8lOyEkKBb5TXbORs4XWfeQcAhZ', 'Accept': 'application/json', 'Content-Type': 'application/json' };

    const cOptions = {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: headers,
        json: true,  // Set this to true to send JSON data
        body: {
            to: body.token,
            notification: {
                title: body.type,
                body: body.msg,
                sound: "default"
            }
        }
    };

    request(cOptions, function (err, resp) {
        if (err) {
            console.error(err);
            return (err);
        } else {
            console.log(resp.body);
            return (true);
        }
    });
}