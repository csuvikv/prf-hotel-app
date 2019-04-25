const nodemailer = require('nodemailer');

module.exports = {
    isAdmin:function(req) {
        return req.isAuthenticated() && req.session.passport.user && req.session.passport.user.admin == true ? true : false;
    }, 
    sendMail:function(user, hotel, romm_number) {
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
            text: 'Dear ' + user.fullname + '!\n The details of your reservation: ' 
          };
          
        return transporter;
    }
}