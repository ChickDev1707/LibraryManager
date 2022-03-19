const nodemailer = require('nodemailer')
const fetch = require('node-fetch')

function sendMail(receiver, message){
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.AUTH_USER, // generated ethereal user
      pass: process.env.AUTH_PASS, // generated ethereal password
    },
  });
  let options = {
    from: '"Library" <thuancoixy234786@gmail.com>',
    to: receiver,
    subject: message.subject,
    html: message.html
  }
  transporter.sendMail(options, function(err, info){
    if(err){
      console.log(err)
      return
    }
    console.log(info.response)
  })
}
async function validateMail(email){
  const api = `https://emailvalidation.abstractapi.com/v1/?api_key=3e25cf1c0fbd4fb3b1ce48974d538818&email=${email}`
  return fetch(api)
    .then(res => res.json())
    .then(data => data);
}
module.exports = {sendMail, validateMail}