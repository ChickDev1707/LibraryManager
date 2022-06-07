const express = require('express');
const router = express.Router();
const authController = require('../controllers/librarian/auth.js')
const userAuth = require('../middlewares/user-auth.js')
const registerBorrowController = require('../controllers/reader/register-borrow.js')
const borrowBookController = require('../controllers/reader/borrow-book.js')
const favoriteBookController=require('../controllers/reader/favorite-books')
const accountController = require('../controllers/reader/account.js');
const fineController = require('../controllers/reader/fine.js');
const accountUpdateMiddleware = require('../middlewares/account-update')
const notificationController = require('../controllers/reader/notification')
const orderController = require("../controllers/reader/order");
const { successOrder } = require("../controllers/reader/payment.js");

// index
router.use(userAuth.checkAuthenticatedAsReader)

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
      .put(accountUpdateMiddleware.checkUpdateProfile, accountController.updateUser)

//fine
router.route('/fine')
      .get(fineController.getFinePage)
//reader
router.route('/api/notification')
      .get(notificationController.returnNotifications)
      .post(notificationController.clientSideReadNotEvent)

//order
router.route("/bookCart")
      .get(orderController.GetCart)
      .post(orderController.AddBook)
      .delete(orderController.DeleteBook);

router.route("/bookCart/json").post(orderController.AddBookJson);

router.route("/checkout")
      .put(orderController.checkOut)
      .post(orderController.CreateOrder);

router.route("/yourOrder")
      .get(orderController.GetAllOrder);

router.route("/yourOrder/:id")
      .get(orderController.GetOrder)
      .put(orderController.updateOrder)

router.get("/order/payment/:orderId/success", successOrder);

router.get("/order/payment/:orderId/cancel", (req, res) => {
  res.redirect(`/yourOrder/${orderId}`);
});

module.exports = router;