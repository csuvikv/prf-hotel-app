const mongoose = require('mongoose');

var hotelSchema = new mongoose.Schema({
    qname: {type: String, unique: true, required: true, lowercase: true},
    city: {type: String},
    rooms: {type: Number},
    bookedRooms: {type: Number}
}, {collection: 'hotel'});


mongoose.model('hotel', hotelSchema);