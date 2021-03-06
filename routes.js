const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const userModel = mongoose.model('user');
const hotelModel = mongoose.model('hotel');
const utils = require('./utils');
const reservationModel = mongoose.model('reservation');
const ObjectId = require('mongodb').ObjectId; 
const  multipart  =  require('connect-multiparty');  
const  multipartMiddleware  =  multipart({ uploadDir:  './' }); 
const fs = require('fs');
var router = express.Router();

router.get('/testConnection', function(req, res) {
    return res.status(200).send({status: "ok"});
});


router.post('/register', function(req, res) {

    if(!req.body.username || !req.body.password) {
        return res.status(400).send({status: "warning", reason: "missing_parameters", details: ["username", "password"]});
    } else {

        userModel.findOne({username: req.body.username}, function(err, user) {
            if (err) {
                return res.status(500).send({status: "error", reason: "database", detalis: error});
            }
            if (user) {
                return res.status(400).send({status: "warning", reason: "duplicate_entry", details: user});
            }
        });

        var user = new userModel({
            username: req.body.username,
            password: req.body.password,
            fullname: req.body.fullname,
            admin: req.body.admin,
            email: req.body.email
        });

        user.save(function(error) {
            if (error) { 
                return res.status(500).send({status: "error", reason: "database", detalis: error});
            }
            return res.status(200).send({status: "ok"});
        });
    }
});


router.post('/login', function (req, res) {
    if (req.body.username && req.body.password) {
        passport.authenticate('local', function (error, username) {
            if (error) {
                return res.status(401).send({status: "warning", reason: "unauthorized", detalis: error});
            } else {
                req.logIn(username, function (error) {
                    if (error) { 
                        return res.status(500).send({status: "error", reason: "database", detalis: error});
                    }
                    return res.status(200).send({status: "ok"});
                })
            }
        })(req, res);
    } else {
        return res.status(400).send({status: "warning", reason: "missing_parameters", details: ["username", "password"]});
    }
});


router.post('/logout', function(req, res) {
    if (req.isAuthenticated()) {
        req.logout();
        res.status(200).send({status: "ok"});
    } else {
        res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


router.get('/users', function(req, res) {
    if (utils.isAdmin(req)) {
        userModel.find({}, function(err, users) {

            if (err) {
                return res.status(500).send({status: "error", reason: "database", detalis: error});
            }
            
            reservationModel.find({}, function(err, reservations) {
                if (err) {
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }

                var formattedUsers = [];
                users.forEach(user => {

                    var formatedReservations = [];
                    reservations.forEach(reservation => {
                        if (reservation && reservation.user == user.username && reservation.valid) {
                            formatedReservations.push({ user: reservation.user, hotel: reservation.hotel, room_number: reservation.room_number, valid: reservation.valid, created: reservation.created });
                        }
                    });

                    formattedUsers.push({
                        username: user.username,
                        password: user.password,
                        fullname: user.fullname,
                        admin: user.admin,
                        email: user.email,
                        reservations: formatedReservations
                    });
                });
                
                 console.log(formattedUsers);
                 return res.status(200).send(formattedUsers);
            });
        });
    } else {
        return res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


router.get('/user', function(req, res) {
   if (req.isAuthenticated()) {
        if (!req.body.username) {
            return res.status(400).send({status: "warning", reason: "missing_parameters", details: ["username"]});
        } else {
            userModel.findOne({username: req.body.username}, function(err, user) {
                if (err) {
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }
                if (!user) {
                    return res.status(404).send({status: "warning", reason: "entity_not_found", details: "user"});
                }
                return res.status(200).send(user);
            });
        }
    } else {
        return res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


router.get('/logged-in-user', function(req, res) {
    if (req.isAuthenticated()) {

        reservationModel.find({}, function(err, reservations) {
            if (err) {
                return res.status(500).send({status: "error", reason: "database", detalis: error});
            }

            var formatedReservations = [];

            reservations.forEach(reservation => {
                if (reservation && reservation.user == req.user.username && reservation.valid) {
                    formatedReservations.push(reservation);
                }
            });

            return res.status(200).send({ reservations: formatedReservations, username: req.user.username, fullname: req.user.fullname, admin:  req.user.admin, email: req.user.email});

        });
     } else {
         return res.status(401).send({status: "warning", reason: "unauthorized"});
     }
 });


router.get('/hotel', function(req, res) {
    if (!req.body.qname) {
        return res.status(400).send({status: "warning", reason: "missing_parameters", details: ["qname"]});
    } else {
        hotelModel.findOne({qname: req.body.qname}, function(err, hotel) {
            if (err) {
                return res.status(500).send({status: "error", reason: "database", detalis: error});
            }
            if (!hotel) {
                return res.status(404).send({status: "warning", reason: "entity_not_found", details: "hotel"});
            }
            return res.status(200).send(hotel);
        });
    }
});

router.post('/new-hotel', multipartMiddleware, (req, res) => {  

    if (utils.isAdmin(req)) {
        if (!req.body.qname) {
            return res.status(400).send({status: "warning", reason: "missing_parameters", details: ["qname"]});
        } else {

            hotelModel.findOne({qname: req.body.qname}, function(err, hotel) {
                if (err) {
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }
                if (hotel) {
                    return res.status(400).send({status: "warning", reason: "duplicate_entry", details: hotel});
                }
            });

            var hotel = new hotelModel({
                qname: req.body.qname,
                fullname: req.body.fullname,
                room_number: req.body.room_number,
                availalble_rooms: req.body.available_rooms
            });

            if (req.files) {

                var images = []

                if (Array.isArray(req.files.image)) {
                    console.log("Array: req.files.image");

                    req.files.image.forEach(image => {
                        console.log(image);
                        if (image) {
                            images.push({ data: fs.readFileSync(image.path), contentType: String });
                        }
                    });

                } else {
                    console.log("Not array: req.files.image");
                    
                    if (req.files.image) {
                        images.push({ data: fs.readFileSync(req.files.image.path), contentType: String });
                    }
                }

                hotel.images = images;
            }

            hotel.save(function(error) {
                if (error) { 
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }
                return res.status(200).send({status: "ok"});
            });
        }
    } else {
        return res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


router.put('/hotel', function(req, res) {
    if (utils.isAdmin(req)) {
        if (!req.body.qname) {
            return res.status(404).send({ status: "warning", reason: "missing_parameters", details: ["qname"]});
        } else {

            hotelModel.findOne({qname: req.body.qname}, function(err, hotel) {
                if (err) {
                    return res.status(500).send({ status: "error", reason: "database", detalis: error});
                }

                if (!hotel) {
                    return res.status(404).send({ status: "warning", reason: "entity_not_found", details: "hotel"});
                }

                hotelModel.updateOne({ qname: hotel.qname }, {$set: {fullname: req.body.fullname, room_number: req.body.room_number, available_rooms: req.body.available_rooms }}, function(err, result) {
                    if (err) { 
                        return res.status(500).send({ status: "error", reason: "database", detalis: error});
                    }
                    return res.status(200).send({ status: "ok", details: result});
                });
            });
        }
    } else {
        return res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


router.put('/user', function(req, res) {
    if (req.isAuthenticated()) {

        var updateObj = {
            fullname: req.body.fullname,
            email: req.body.email
        };

        if (req.body.password) {
            updateObj.password = req.body.password;
        }

        userModel.updateOne({ username: req.user.username}, {$set: updateObj}, function(err, result) {
            if (err) { 
                return res.status(500).send({status: "error", reason: "database", detalis: error});
            }
            return res.status(200).send({status: "ok", details: result});
        });
    } else {
        return res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


router.get('/hotels', function(req, res) {
    hotelModel.find({}, function(err, hotels) {
        if (err) {
            return res.status(500).send({status: "error", reason: "database", detalis: error});
        }
        return res.status(200).send(hotels);
    });
});


router.put('/invalidate-reservation', function(req, res) {
    if (utils.isAdmin(req)) {
        if (!req.body.hotel || !req.body.user || !req.body.room_number) {
            return res.status(400).send({status: "warning", reason: "missing_parameters", details: ["hotel", "user", "room_number"]});
        } else {
            console.log(req.body.hotel, req.body.user, req.body.room_number);
            console.log("--------------------------------------------------");
            reservationModel.findOne({user: req.body.user, hotel: req.body.hotel, room_number: req.body.room_number}, function(err, reservation) {
                if (!reservation) {
                    return res.status(404).send({status: "warning", reason: "entity_not_found", details: "reservation"});
                }
                console.log(reservation);
                console.log("--------------------------------------------------");
                reservationModel.updateOne({ user: reservation.user, hotel: reservation.hotel, room_number: reservation.room_number }, {$set: {valid: false }}, function(err, result) {
                    if (err) { 
                        return res.status(500).send({status: "error", reason: "database", detalis: error});
                    }
                    console.log(result);
                    return res.status(200).send({status: "ok"});
                });
            });
        }
    } else {
        return res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


router.post('/user', function(req, res) {
    if (req.isAuthenticated()) {
        if (!req.body.username) {
            return res.status(400).send({status: "warning", reason: "missing_parameters", details: ["username"]});
        } else {
            userModel.findOne({username: req.body.username}, function(err, user) {
                if (err) {
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }
                if (!user) {
                    return res.status(404).send({status: "warning", reason: "entity_not_found", details: "user"});
                }

                userModel.deleteOne({username: req.body.username}, function(err, result) {
                    if (err) { 
                        return res.status(500).send({status: "error", reason: "database", detalis: error});
                    }
                    return res.status(200).send({status: "ok", details: result});
                });
            });
        }
    } else {
        return res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


router.post('/hotel', function(req, res) {
    if (utils.isAdmin(req)) {
        if (!req.body.qname) {
            return res.status(400).send({status: "warning", reason: "missing_parameters", details: ["qname"]});
        } else {
            hotelModel.findOne({qname: req.body.qname}, function(err, hotel) {
                if (err) {
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }
                if (!hotel) {
                    return res.status(404).send({status: "warning", reason: "entity_not_found", details: "hotel"});
                }
                
                hotelModel.deleteOne({qname: req.body.qname}, function(err, result) {
                    if (err) { 
                        return res.status(500).send({status: "error", reason: "database", detalis: error});
                    }
                    return res.status(200).send({status: "ok", details: result});
                });
            });
        }
    } else {
        return res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


router.post('/reservate', function(req, res) {

    if (req.isAuthenticated()) {
        if (!req.body.hotel || !req.body.user || !req.body.room_number) {
            return res.status(400).send({status: "warning", reason: "missing_parameters", details: ["hotel", "user", "room_number"]});
        } else {
            var found_hotel = undefined;

            hotelModel.findOne({qname: req.body.hotel}, function(err, hotel) {
                if (err) {
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }

                userModel.findOne({username: req.body.user}, function(err, user) {
                    if (err) {
                        return res.status(500).send({status: "error", reason: "database", detalis: error});
                    }

                    if (!user) {
                        return res.status(404).send({status: "warning", reason: "entity_not_found", details: "user"});
                    }
                    if (!hotel) {
                        return res.status(404).send({status: "warning", reason: "entity_not_found", details: "hotel"});
                    }
        
                    if (hotel.isFull()) {
                        return res.status(404).send({status: "warning", reason: "entity_not_found", details: "hotel is full"});
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
                            return res.status(500).send({status: "error", reason: "database", detalis: error});
                        }

                        userModel.updateOne({username: user.username }, {$set: {reservations: new_reservations }}, function(err, result) {
                            if (err) { 
                                return res.status(500).send({status: "error", reason: "database", detalis: error});
                            }
                            
                            hotelModel.updateOne({qname: hotel.qname }, {$set: {availalble_rooms: hotel.availalble_rooms-1 }}, function(err, result) {
                                if (err) { 
                                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                                }

                                return utils.sendMail(user, hotel, req.body.room_number, res);
                            });
                        });
                    });
                });
            });
        }
    } else {
        return res.status(401).send({status: "warning", reason: "unauthorized"});
    }
});


module.exports = router;