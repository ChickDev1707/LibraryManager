const express = require('express');
const userAuth = require('../middlewares/user-auth.js')
const authController = require('../controllers/user/auth.js')

module.exports = function(passport){
  const router = express.Router();

  // index
  router.route('/').get(userAuth.decideUserPage, async (req, res)=>{
      res.render(req.userPage)
  })
  // login route
  router.route('/login')
        .get(userAuth.checkNotAuthenticated, authController.sendLoginPage)
        .post(userAuth.checkNotAuthenticated, passport.authenticate('local', {
          successRedirect: '/',
          failureRedirect: '/login',
          failureFlash: true
        }))
  return router
}