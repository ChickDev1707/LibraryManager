const express = require('express');
const router = express.Router();

const authController = require('../controllers/librarian/auth.js');
const bookController = require('../controllers/librarian/manage-book.js')
const registerBorrowCardController = require('../controllers/librarian/register-borrow-card.js')
const reportController = require('../controllers/librarian/report')
const bookMiddleWares = require('../middlewares/book-check')
const userAuth = require('../middlewares/user-auth.js')
const borrowController = require('../controllers/librarian/borrow-book')
const fineController = require('../controllers/librarian/fine')
const policyController = require('../controllers/librarian/policy')
const notificationController = require('../controllers/librarian/notification')
const {checkNewBorrow} = require('../middlewares/borrow-book')

const confirmBook=require('../controllers/librarian/confirm-return-book.js')
const readerController=require('../controllers/librarian/manage-reader')
const orderController = require("../controllers/librarian/order");

router.use(userAuth.checkAuthenticatedAsLibrarian)
// auth
router.delete('/logout', authController.logOut)

// manage-book
router.route('/books')
      .get(bookController.all)
      .post(bookMiddleWares.checkNewBook, bookController.saveBook)

router.route('/books/import')
      .post(bookController.uploadBook.single('uploadfile'), bookController.importBooks)      

router.route('/books/:id')
      .get(bookController.bookDetail)
      .put(bookMiddleWares.checkUpdateBook, bookController.updateBook)
      .delete(bookController.deleteBook)
      .post(bookController.addChildBook)

router.delete('/books/:id/:child', bookController.deleteChildBook)

// manage reader
router.route('/reader')
      .get(readerController.getAllReader)
      .post(readerController.uploadReader.single('uploadfile'),readerController.addReader)

router.route('/reader/:id')
      .get(readerController.getReader)
      .delete(readerController.deleteReader)

router.route('/reader/:id/edit')
      .get(readerController.formEditReader)
      .put(readerController.editReader)

//borow books
router.route('/borrow')
      .get(borrowController.borrowForm)
      .post(checkNewBorrow, borrowController.saveBorrowCard)

router.get("/borrow/books", borrowController.getBorrowBook)

// fine
router.route('/fine')
      .get(fineController.getAllFine)
      .post(fineController.saveFine)

router.route('/confirm-return-book')
      .get(confirmBook.getConfirmReturnBook)
      .put(confirmBook.putConfirmReturnBook)
//manage register-borrow-card
router.route('/confirm-register-borrow')
      .get(registerBorrowCardController.getConfirmRegisterPage)

router.route('/confirm-register-borrow/confirm/:id')
      .put(registerBorrowCardController.confirmRegisterBorrowCard)

router.route('/confirm-register-borrow/deny/:id')
      .put(registerBorrowCardController.denyRegisterBorrowCard)

//report
router.route('/month-report')
      .get(reportController.getMonthReportPage)
      
router.route('/day-report')
      .get(reportController.getDayReportPage)

// policy
router.route('/policy')
      .get(policyController.getPolicyMainPage)
      .post(policyController.updateReaderPolicies)
router.route('/policy/book-category')
      .get(policyController.getPolicyCategoryPage)
      .post(policyController.addNewBookCategory)
router.route('/policy/book-category/:id')
      .put(policyController.editBookCategory)
      .delete(policyController.deleteBookCategory)
router.route('/policy/borrow-book')
      .get(policyController.getPolicyBorrowBookPage)
      .post(policyController.updatePolicyBorrowBook)
     
router.route('/policy/fine')
      .get(policyController.getPolicyFinePage)
      .post(policyController.updateFinePolicies)
router.route('/api/notification')
      .get(notificationController.returnNotifications)
      .post(notificationController.clientSideReadNotEvent)

// Order
router.route("/order")
      .get(orderController.getOrders)
router.route("/order/:id")
      .put(orderController.updateOrder);
module.exports = router