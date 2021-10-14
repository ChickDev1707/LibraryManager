const express = require('express');
const userAuth = require('../../middlewares/user-auth.js')

module.exports = function(passport){
  
  const router = express.Router();
  router.get('/', userAuth.checkNotAuthenticated, async (req, res)=>{
    try{   
      res.render('shared/login.ejs')
    }catch{
      console.log("error")
    }
  })
  router.post('/', userAuth.checkNotAuthenticated, passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
  }))
  return router
}