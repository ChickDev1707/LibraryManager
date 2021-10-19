
const userAuth = require('../../middlewares/user-auth.js')

function logOut(req, res){ 
  req.logOut()
  res.redirect('/login')
}

module.exports = {
  logOut
}
