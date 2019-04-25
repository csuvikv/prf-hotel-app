const mongoose = require('mongoose');
const reservationShema = require("./reservation.model")

var hotelSchema = new mongoose.Schema({
    qname: {type: String, unique: true, required: true, lowercase: true},
    fullname: {type: String},
    room_number: {type: Number},
    availalble_rooms: {type: Number},
    image: { data: Buffer, contentType: String }
}, {collection: 'hotel'});


hotelSchema.methods.isFull = function() {
    if (this.availalble_rooms <= 0) {
        return true;
    }
    return false;
};


mongoose.model('hotel', hotelSchema);