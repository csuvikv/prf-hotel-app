const nodemailer = require('nodemailer');

module.exports = {
    isAdmin:function(req) {
        return req.isAuthenticated() && req.session.passport.user && req.session.passport.user.admin == true ? true : false;
    }, 
    sendMail:function(user, hotel, room_number, res) {
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
          
          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                return res.status(500).send({status: "error", reason: "email", detalis: error});
            } else {
                return res.status(200).send({status: "ok"});
            }
        });
    }
}