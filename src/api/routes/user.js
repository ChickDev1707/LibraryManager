const express = require('express');
const userAuth = require('../middlewares/user-auth.js')
const authController = require('../controllers/user/auth.js');
const searchBookController = require('../controllers/user/search-book.js')
const allBookController = require('../controllers/user/all-book.js')
const {verifyReaderAccount} = require('../controllers/reader/account')

module.exports = function(passport){
  const router = express.Router();

  // index
  router.route('/verify-account')
        .post(verifyReaderAccount)
        
  router.route('/').get(userAuth.decideUserPage, searchBookController.searchBook)

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
  router.route('/comment/:bookHeadId')
        .post(searchBookController.comment)
        .put(searchBookController.editComment)
        .delete(searchBookController.deleteComment)

  router.route('/books/page/:id')
        .get(userAuth.decideAllBookPage, allBookController.getPage)
  
  router.route('/autocomplete/').get(searchBookController.autocompleteSearch)

  return router
}

// search book route

