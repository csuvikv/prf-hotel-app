const mongoose = require('mongoose');
const utils = require('./utils');
const reservationShema = require("./reservation.model")

var userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true, lowercase: true},
    password: {type: String, required: true},
    fullname: {type: String},
    admin: {type: Boolean},
    email: {type: String, required: true},
    reservations: [{reservationShema}]
}, {collection: 'user'});


userSchema.pre('save', function(next) {
    return utils(this, next);
});

userSchema.pre("update", function(next) {
    return utils(this, next);
});


userSchema.methods.comparePasswords = function(password, next) {
    bcrypt.compare(password, this.password, function(error, isMatch) {
        next(error, isMatch);
    });
};

mongoose.model('user', userSchema);