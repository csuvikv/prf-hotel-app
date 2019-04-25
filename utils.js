const nodemailer = require('nodemailer');

module.exports = {
    isAdmin:function(req) {
        return req.isAuthenticated() && req.session.passport.user && req.session.passport.user.admin == true ? true : false;
    }, 
    sendMail:function(user, hotel, room_number) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'prfhotelapp@gmail.com',
              pass: 'prfhotelapp123'
            }
          });
          
          var mailOptions = {
            from: 'prfhotelapp@gmail.com',
            to: user.email,
            subject: 'Your reservation was successful!',
            text: 'Dear ' + user.fullname + '!' +
                  '\n Your reservetion in ' + hotel.fullname + ' was successful.' +
                  '\n The details of your reservation:' +
                  '\n Hotel: ' + hotel.fullname + 
                  '\n Rooom number:' + room_number + 
                  '\n Given name: ' + user.fullname +
                  '\n Given email address: ' + user.email +
                  '\n Best regards,' +
                  '\n prf-hotel-app'
          };
          
        return transporter;
    }
}