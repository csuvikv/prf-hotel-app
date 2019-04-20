const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const userModel = mongoose.model('user');
const hotelModel = mongoose.model('hotel');
var router = express.Router();

router.get('/', function(req, res) {
    if(req.isAuthenticated()) {
        return res.status(200).send("Hello World");
    } else {
        return res.status(403).send("You are not welcome here");
    }
});


router.get('/testConnection', function(req, res) {
    return res.status(200).send({"connection": "ok"});
});


router.post('/register', function(req, res) {

    //console.log(req.headers);
    //console.log(req.body);
    //console.log("Query parameterek", req.query);

    if(!req.body.username || !req.body.password) {
        return res.status(404).send("username or password missing");
    } else {
        var user = new userModel({username: req.body.username, password: req.body.password});
        user.save(function(error) {
            if (error) { 
                return res.status(500).send("db error")
            };
            return res.status(200).send("registration success");
        })
    }
});


router.post('/login', function (req, res) {
    if (req.body.username && req.body.password) {
        passport.authenticate('local', function (error, username) {
            if (error) {
                return res.status(403).send(error);
            } else {
                req.logIn(username, function (error) {
                    if (error) return res.status(500).send(error);
                    return res.status(200).send("login successful");
                })
            }
        })(req, res);
    } else {
        return res.status(403).send("username and password required");
    }
});


router.post('/logout', function(req, res) {
    if(req.isAuthenticated()) {
        req.logout();
        res.status(200).send("You have been logged out");
    } else {
        res.status(403).send("You have to log in first");
    }
});


router.get('/users', function(req, res) {
    if(req.isAuthenticated() && req.session.passport.user.username === "admin") {
        userModel.find({}, function(err, users) {
            return res.status(200).send(users);
        })
    } else {
        return res.status(403).send("Unauthorized access");
    }
});


router.post('/new-hotel', function(req, res) {
    if(!req.body.qname) {
        return res.status(404).send("name is missing");
    } else {
        var hotel = new hotelModel({qname: req.body.qname, city: req.body.city, rooms: req.body.rooms, bookedRooms: req.body.bookedRooms});
        hotel.save(function(error) {
            if (error) { 
                return res.status(500).send("db error");
            }
            return res.status(200).send("Hotel added successfully");
        })
    }
});


router.get('/hotels', function(req, res) {
    hotelModel.find({}, function(err, hotels) {
        return res.status(200).send(hotels);
    })
});

module.exports = router;