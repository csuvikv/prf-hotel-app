const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const userModel = mongoose.model('user');
const hotelModel = mongoose.model('hotel');
const utils = require('./utils');
const reservationModel = mongoose.model('reservation');
var router = express.Router();

router.get('/testConnection', function(req, res) {
    return res.status(200).send({status: "ok"});
});


router.post('/register', function(req, res) {

    if(!req.body.username || !req.body.password) {
        return res.status(404).send({status: "warning", reason: "missing_parameters", details: ["username", "password"]});
    } else {

        userModel.findOne({username: req.body.username}, function(err, user) {
            if (err) {
                return res.status(500).send({status: "error", reason: "database", detalis: error});
            }
            if (user) {
                return res.status(404).send({status: "warning", reason: "duplicate_entry", details: user});
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
                return res.status(403).send(error);
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
        return res.status(403).send({status: "warning", reason: "missing_parameters", details: ["username", "password"]});
    }
});


router.post('/logout', function(req, res) {
    if (req.isAuthenticated()) {
        req.logout();
        res.status(200).send({status: "ok"});
    } else {
        res.status(403).send({status: "warning", reason: "unauthorized"});
    }
});


router.get('/users', function(req, res) {
    if (utils.isAdmin(req)) {
        userModel.find({}, function(err, users) {
            if (err) {
                return res.status(500).send({status: "error", reason: "database", detalis: error});
            }
            return res.status(200).send(users);
        });
    } else {
        return res.status(403).send({status: "warning", reason: "unauthorized"});
    }
});


router.get('/user', function(req, res) {
   if (req.isAuthenticated()) {
        if (!req.body.username) {
            return res.status(404).send({status: "warning", reason: "missing_parameters", details: ["username"]});
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
        return res.status(403).send({status: "warning", reason: "unauthorized"});
    }
});


router.get('/hotel', function(req, res) {
    if (!req.body.qname) {
        return res.status(404).send({status: "warning", reason: "missing_parameters", details: ["qname"]});
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


router.post('/new-hotel', function(req, res) {
    if (utils.isAdmin(req)) {
        if (!req.body.qname) {
            return res.status(404).send({status: "warning", reason: "missing_parameters", details: ["qname"]});
        } else {

            hotelModel.findOne({qname: req.body.qname}, function(err, hotel) {
                if (err) {
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }
                if (hotel) {
                    return res.status(404).send({status: "warning", reason: "duplicate_entry", details: hotel});
                }
            });

            /*var image = fs.readFileSync(req.files.file);
            var encImg = image.toString('base64');*/

            var hotel = new hotelModel({
                qname: req.body.qname,
                fullname: req.body.fullname,
                room_number: req.body.room_number,
                availalble_rooms: req.body.availalble_rooms});

            hotel.save(function(error) {
                if (error) { 
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }
                return res.status(200).send({status: "ok"});
            });
        }
    } else {
        return res.status(403).send({status: "warning", reason: "unauthorized"});
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

                hotelModel.updateOne({ qname: hotel.qname }, {$set: {fullname: req.body.fullname, room_number: req.body.room_number, availalble_rooms: req.body.availalble_rooms }}, function(err, result) {
                    if (err) { 
                        return res.status(500).send({ status: "error", reason: "database", detalis: error});
                    }
                    return res.status(200).send({ status: "ok", details: result});
                });
            });
        }
    } else {
        return res.status(403).send({status: "warning", reason: "unauthorized"});
    }
});


router.put('/user', function(req, res) {
    if (req.isAuthenticated()) {
        if(!req.body.username) {
            return res.status(404).send({status: "warning", reason: "missing_parameters", details: ["username"]});
        } else {
            userModel.findOne({username: req.body.username}, function(err, user) {
                if (err) {
                    return res.status(500).send({status: "error", reason: "database", detalis: error});
                }
                if (!user) {
                    return res.status(404).send({status: "warning", reason: "entity_not_found", details: "user"});
                }

                userModel.updateOne({ username: req.body.username}, {$set: {username: req.body.username, password: req.body.password, fullname: req.body.fullname, email: req.body.email }}, function(err, result) {
                    if (err) { 
                        return res.status(500).send({status: "error", reason: "database", detalis: error});
                    }
                    return res.status(200).send({status: "ok", details: result});
                });
            });
        }
    } else {
        return res.status(403).send({status: "warning", reason: "unauthorized"});
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
            return res.status(404).send({status: "warning", reason: "missing_parameters", details: ["hotel", "user", "room_number"]});
        } else {
            reservationModel.findOne({user: req.body.user, hotel: req.body.hotel, room_number: req.body.room_number}, function(err, reservation) {
                if (!reservation) {
                    return res.status(404).send({status: "warning", reason: "entity_not_found", details: "reservation"});
                }
                reservationModel.updateOne({ reservation }, {$set: {valid: false }}, function(err, result) {
                    if (err) { 
                        return res.status(500).send({status: "error", reason: "database", detalis: error});
                    }
                    return res.status(200).send({status: "ok"});
                });
            });
        }
    } else {
        return res.status(403).send({status: "warning", reason: "unauthorized"});
    }
});


router.delete('/user', function(req, res) {
    if (utils.isAdmin(req)) {
        if (!req.body.username) {
            return res.status(404).send({status: "warning", reason: "missing_parameters", details: ["username"]});
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
        return res.status(403).send({status: "warning", reason: "unauthorized"});
    }
});


router.delete('/hotel', function(req, res) {
    if (utils.isAdmin(req)) {
        if (!req.body.qname) {
            return res.status(404).send({status: "warning", reason: "missing_parameters", details: ["qname"]});
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
        return res.status(403).send({status: "warning", reason: "unauthorized"});
    }
});


router.post('/reservate', function(req, res) {
    if (req.isAuthenticated()) {
        if (!req.body.hotel || !req.body.user || !req.body.room_number) {
            return res.status(404).send({status: "warning", reason: "missing_parameters", details: ["hotel", "user", "room_number"]});
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
                                return utils.sendMail(user, hotel, room_number, res);
                            });
                        });
                    });
                });
            });
        }
    } else {
        return res.status(403).send({status: "warning", reason: "unauthorized"});
    }
});


module.exports = router;