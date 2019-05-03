const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

module.exports = {
    hashPassword:function(user, next) {
        if(user.isModified('password')) {
            bcrypt.genSalt(10, function(error, salt) {
                if(error) {
                    return next(error);
                }
                bcrypt.hash(user.password, salt, function(error, hash) {
                    if(error) {
                        return next(error);
                    }
                    user.password = hash;
                    return next();
                });
            });
        } else {
            return next();
        }
    },
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
                  '\n\n Your reservetion in ' + hotel.fullname + ' was successful.' +
                  '\n The details of your reservation:' +
                  '\n Hotel: ' + hotel.fullname + 
                  '\n Rooom number:' + room_number + 
                  '\n Given name: ' + user.fullname +
                  '\n Given email address: ' + user.email +
                  '\n\n Best regards,' +
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