const urlHelper = require('../../helpers/url')

function sendLoginPage(req, res){
  let errorList = req.flash('error')
  if(errorList.length != 0){
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/login/`, {
      type: 'error',
      message: errorList[0]
    })
    res.redirect(redirectUrl)
  }else{
    res.render('user/login.ejs')
  }
}

module.exports = {
  sendLoginPage,
}