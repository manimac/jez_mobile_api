var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var cors = require('cors');
const DB = require('./config/db');
const appUtil = require('./app/apputil');
var schedule = require('node-schedule');
var app = express();
const port = 8080;
var path = require('path');
const dotenv = require('dotenv');
dotenv.config();



require('./config/passport')(passport); // pass passport for configuration
/**
 * bodyParser.urlencoded() parses the text as URL encoded data 
 * (which is how browsers tend to send form data from regular forms set to POST) 
 * and exposes the resulting object (containing the keys and values) on req.body.
 */
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth) 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

// required for passport
app.use(session({
    secret: appUtil.jwtSecret,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

const db = require("./app/models");
db.sequelize.sync();

// Setting the app router and static folder
app.use(express.static(path.resolve('./public')));
app.use('/jezsel', express.static(path.resolve('./public'))); //<--new line added


app.use('uploads', express.static(path.join(__dirname, '/uploads')));
/* Need below for Build */
/* Need below for Build */
app.use('', express.static(path.join(__dirname, '/dist')));
app.use('/jezsel', express.static(path.join(__dirname, '/dist')));
app.get('/', (request, response) => {
    response.sendfile(path.join(__dirname + '/dist/index.html'));
})
app.get('/jezsel', (request, response) => {
        response.sendfile(path.join(__dirname + '/dist/index.html'));
    })
    /* End of Need for Build */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({ type: 'application/*+json' }));

// Routes files
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);
app.use('/jezsel/api', authRoutes);
const userRoutes   = require('./routes/user');
app.use('/user',userRoutes);
app.use('/jezsel/user',userRoutes);
const portalRoute = require('./routes/portal');
app.use('/jezsel', portalRoute);
// Server listener
app.listen(process.env.PORT || port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})

const orderController = require('./app/controller/order.controller');
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 1);
// job = schedule.scheduleJob(rule, function() {
    // console.log('Hi..............');
    // console.error(rule);
    // orderController.findOrderExpireNotification();
    // orderController.findExpiredOrderForInvoice();
// });