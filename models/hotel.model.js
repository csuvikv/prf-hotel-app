const mongoose = require('mongoose');

var hotelSchema = new mongoose.Schema({
    qname: {type: String, unique: true, required: true, lowercase: true},
    fullname: {type: String},
    room_number: {type: Number},
    available_rooms: {type: Number},
    image: { data: Buffer, contentType: String }
}, {collection: 'hotel'});


hotelSchema.methods.isFull = function() {
    if (this.availalble_rooms <= 0) {
        return true;
    }
    return false;
};

mongoose.model('hotel', hotelSchema);