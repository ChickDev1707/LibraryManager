const express = require('express');
const router = express.Router();
const authController = require('../controllers/librarian/auth.js')
const userAuth = require('../middlewares/user-auth.js')
const registerBorrowController = require('../controllers/reader/register-borrow.js')
const borrowBookController = require('../controllers/reader/borrow-book.js')
const favoriteBookController=require('../controllers/reader/favorite-books')
const accountController = require('../controllers/reader/account.js');
// index
router.route('/').get(userAuth.checkAuthenticatedAsReader, (req, res)=>{
  res.render('reader/index.ejs')
})
// auth
router.delete('/logout', authController.logOut)

// register borrow book
// cart -------
router.route('/cart')
      .get(registerBorrowController.showCartPage)
      .post(registerBorrowController.addNewBookHeadToCart)
router.delete('/cart/register-tickets/:id', registerBorrowController.deleteBookHeadFromCart)
router.delete('/cart/register-tickets', registerBorrowController.deleteSelectedBookHeadFromCart)

// register borrow book ----------
router.post('/cart/register', registerBorrowController.registerBorrowBook)
router.route('/register-tickets')
      .get(registerBorrowController.showViewRegisterPage)

// view borrow book
router.route('/borrow-cards')
      .get(borrowBookController.showViewBorrowCardsPage)

router.route('/favorite-books')
      .get(favoriteBookController.getFavoriteBook)
      .post(favoriteBookController.postFavoriteBook)
      .put(favoriteBookController.putFavoriteBook)

//Manage account      
router.route("/account")
      .get(accountController.getUserProfile)
      .put(accountController.updateUser)
      
module.exports = router;