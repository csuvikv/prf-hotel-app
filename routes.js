const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const userModel = mongoose.model('user');
const hotelModel = mongoose.model('hotel');
const reservationModel = mongoose.model('reservation');
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

/* Post.findOneAndUpdate(
    {"_id": req.params.id}, 
    {$push: {comments: {
        comment: "Hello World",
        user: "933ujrfn393r"
    }}
})*/

router.post('/register', function(req, res) {

    if(!req.body.username || !req.body.password) {
        return res.status(404).send("username or password missing");
    } else {

        var user = new userModel({
            username: req.body.username,
            password: req.body.password,
            fullname: req.body.fullname,
            admin: req.body.admin,
            email: req.body.email
        });

        user.save(function(error) {
            if (error) { 
                console.log(error);
                return res.status(500).send("db error");
                
            };
            return res.status(200).send("registration success");
        });
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
    if (req.isAuthenticated() && req.session.passport.user.admin == true) {
        userModel.find({}, function(err, users) {
            if (err) {
                return res.status(500).send("db error");
            }
            return res.status(200).send(users);
        });
    } else {
        return res.status(403).send("Unauthorized access");
    }
});


router.post('/new-hotel', function(req, res) {
    if (!req.body.qname) {
        return res.status(404).send("name is missing");
    } else {

        /*var image = fs.readFileSync(req.files.file);
        var encImg = image.toString('base64');*/

        var hotel = new hotelModel({
            qname: req.body.qname,
            fullname: req.body.fullname,
            room_number: req.body.room_number,
            availalble_rooms: req.body.availalble_rooms});

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
    });
});


router.post('/invalidate/reservation', function(req, res) {
    if (!req.body.hotel || !req.body.user || !req.body.room_number) {
        return res.status(404).send("hotel or user or room_number is missing");
    } else {
        reservationModel.findOne({user: req.body.user, hotel: req.body.hotel, room_number: req.body.room_number}, function(err, reservation) {
            if (!reservation) {
                return res.status(404).send("The given reservation not found");
            }
            reservationModel.updateOne({ reservation }, {$set: {valid: false }}, function(err, result) {
                if (err) { 
                    return res.status(500).send("db error");
                }

                return res.status(200).send("Reservation invalidated successfully");
            });
        });
    }
});

router.post('/reservate', function(req, res) {
    if (!req.body.hotel || !req.body.user || !req.body.room_number) {
        return res.status(404).send("hotel or user or room_number is missing");
    } else {
        var found_hotel = undefined;

        hotelModel.findOne({qname: req.body.hotel}, function(err, hotel) {
            if (err) {
                return res.status(500).send("db error");
            }
            
            userModel.findOne({username: req.body.user}, function(err, user) {
                if (err) {
                    return res.status(500).send("db error");
                }

                if (!user) {
                    return res.status(404).send("The given user not found");
                }
                if (!hotel) {
                    return res.status(404).send("The given hotel not found");
                }
    
                if (hotel.isFull()) {
                    return res.status(404).send("The given hotel is full");
                }
        
                var reservation = new reservationModel({
                    hotel: req.body.hotel,
                    user: req.body.user,
                    room_number: req.body.room_number,
                    valid: true
                });
                
                if (req.body.created) {
                    reservation.created = req.body.created;
                }
    
                var new_reservations = user.reservations;
                new_reservations.push(reservation);
    
                reservation.save(function(error) {
                    if (error) { 
                        return res.status(500).send("db error");
                    }
    
                    userModel.updateOne({username: user.username }, {$set: {reservations: new_reservations }}, function(err, result) {
                        if (err) { 
                            return res.status(500).send("db error");
                        }
                        
                        hotelModel.updateOne({qname: hotel.qname }, {$set: {availalble_rooms: hotel.availalble_rooms-1 }}, function(err, result) {
                            if (err) { 
                                return res.status(500).send("db error");
                            }
        
                            return res.status(200).send("Reservation added successfully");
                        });
                    });
                });
            });
        });
    }
});


module.exports = router;