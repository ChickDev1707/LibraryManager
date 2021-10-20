const express = require('express');
const userAuth = require('../middlewares/user-auth.js')
const authController = require('../controllers/user/auth.js');
const searchBookController = require('../controllers/user/search-book.js')

module.exports = function(passport){
  const router = express.Router();

  // index
  router.route('/').get(searchBookController.searhBook, userAuth.decideUserPage, async (req, res)=>{
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

  // show book detail route
  router.route('/book-head/:id').get(searchBookController.showBookDetail)
  
  //comment book route
  router.route('/comment/:id').post(searchBookController.comment)

  return router
}



// search book route

