
function sendLoginPage(req, res){
  res.render('user/login.ejs')
}
function authenticateUser(req, res, passport){
  
}

module.exports = {
  sendLoginPage,
  authenticateUser
}