
function sendLoginPage(req, res){
  res.render('user/login.ejs')
}

module.exports = {
  sendLoginPage,
}