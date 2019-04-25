const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const path = require('path')
const cors = require('cors');
require('./models/user.model');
require('./models/hotel.model');
require('./models/reservation.model');


const dbUrl = "mongodb://dbUser:dbUserPassword@cluster0-shard-00-00-6whz0.mongodb.net:27017,cluster0-shard-00-01-6whz0.mongodb.net:27017,cluster0-shard-00-02-6whz0.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";
const PORT = process.env.PORT || 5000
const userModel = mongoose.model('user');

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(cookieParser());

app.set('dbUrl', dbUrl);
mongoose.connect(dbUrl);


mongoose.connection.on('connected', function() {
    console.log('db connected');
});

mongoose.connection.on('error', function() {
    console.log('db connection error');
});


passport.serializeUser(function(user, done) {
    if(!user) { return done("Serialization error", user); }
    return done(null, user);
});

passport.deserializeUser(function(user, done) {
    if(!user) { return done("Deserialization error", user); }
    return done(null, user);
});

passport.use('local', new localStrategy(function(username, password, done) {
    userModel.findOne({username: username}, function(err, user) {
        if (err) {
            return done({status: "error", reason: "database", detalis: error}, false);
        }
        if(!user) { 
            return done({status: "warning", reason: "entity_not_found", details: "user"}, false);
        }
        user.comparePasswords(password, function(err, isMatch) {
            if(err || !isMatch) {
                return done({status: "warning", reason: "entity_not_found", details: "password"}, false);
            }
            return done(null, user);
        });
    });
}));


app.use(expressSession({secret: 'secret'}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', require('./routes'));


app.listen(PORT, function() {
    console.log('the server is running');
});

