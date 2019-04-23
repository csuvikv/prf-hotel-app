const mongoose = require('mongoose');

var reservationSchema = new mongoose.Schema({
    user: {type: String, required: true, lowercase: true},
    hotel: {type: String, required: true, lowercase: true},
    room_number: {type: Number, required: true},
    valid: {type: Boolean},
    created: {type: Date, default: Date.now()}
});

mongoose.model('reservation', reservationSchema);