const express = require('express');
const router = express.Router();
const authController = require('../controllers/librarian/auth.js')
const userAuth = require('../middlewares/user-auth.js')
const registerBorrowController = require('../controllers/reader/register-borrow.js')
// index
router.route('/').get(userAuth.checkAuthenticatedAsReader, (req, res)=>{
  res.render('reader/index.ejs')
})
// auth
router.delete('/logout', authController.logOut)

// register borrow book
router.route('/cart')
      .get(registerBorrowController.showCartPage)
      .post(registerBorrowController.addNewBookHeadToCart)

router.post('/cart/register', registerBorrowController.registerBorrowBook)
router.delete('/cart/register-tickets/:id', registerBorrowController.deleteBookHeadFromCart)
router.delete('/cart/register-tickets', registerBorrowController.deleteSelectedBookHeadFromCart)

module.exports = router;