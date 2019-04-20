// Ez volt egy minimalista szerver Node.js-ben
/*const http = require("http");

http.createServer(function (req, res) {
    res.write('Hello World!');
    res.end();
}).listen(5000);*/

// innen jon az Express

// mongodb://user:<PASSWORD>@prf-example01-shard-00-00-

const express = require('express');
var app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const cors = require('cors');

var corsOptions = {
    origin: "http://localhost:4200",
    credentials: true
};

// docker run -d -p 27017:27017 -v $PWD/mongo:/etc/mongo --name mymongo mongo

const dbUrl = "mongodb://dbUser:dbUserPassword@cluster0-shard-00-00-6whz0.mongodb.net:27017,cluster0-shard-00-01-6whz0.mongodb.net:27017,cluster0-shard-00-02-6whz0.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";

app.set('dbUrl', dbUrl);

require('./user.model');
//require('./book.model');

const userModel = mongoose.model('user');

mongoose.connect(dbUrl);

mongoose.connection.on('connected', function() {
    console.log('db connected');
});

mongoose.connection.on('error', function() {
    console.log('db connection error');
});


passport.serializeUser(function(user, done) {
    if(!user) return done("serializalasi hiba", user);
    return done(null, user);
});

passport.deserializeUser(function(user, done) {
    if(!user) return done("serializalasi hiba", user);
    return done(null, user);
});

passport.use('local', 
    new localStrategy(function(username, password, done) {
        userModel.findOne({username: username}, function(err, user) {
            if(!user || err) return done("cannot get user", false);
            user.comparePasswords(password, function(err, isMatch) {
                if(err || !isMatch) return done("password incorrect", false);
                return done(null, user);
            });
        });
    }));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors(corsOptions));

app.use(expressSession({secret: '12354456462almajjimnhgiknb,'}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes'));
app.use('/proba', require('./routes'));

app.listen(5000, function() {
    console.log('the server is running');
});

