const express = require('express');
const router = express.Router();

const authController = require('../controllers/librarian/auth.js');
const bookController = require('../controllers/librarian/manage-book.js')
const registerBorrowCardController = require('../controllers/librarian/register-borrow-card.js')
const bookMiddleWares = require('../middlewares/book-check')
const userAuth = require('../middlewares/user-auth.js')
const borrowController = require('../controllers/librarian/borrow-book')
const fineController = require('../controllers/librarian/fine')
const policyController = require('../controllers/librarian/policy')
const {upload} = require('../services/librarian/manage-book-service')

const confirmBook=require('../controllers/librarian/confirm-return-book.js')

const readerController=require('../controllers/librarian/manage-reader')
// index
router.route('/').get(userAuth.checkAuthenticatedAsLibrarian)
// auth
router.delete('/logout', authController.logOut)

// manage-book
router.route('/books')
      .get(bookController.all)
      .post(upload.single('anh_bia'), bookMiddleWares.checkNewBook, bookController.saveBook)

router.get('/books/new', bookController.newBookForm)

router.route('/books/:id')
      .get(bookController.bookDetail)
      .put(upload.single('anh_bia'), bookMiddleWares.checkUpdateBook, bookController.updateBook)
      .delete(bookController.deleteBook)

router.get('/books/:id/edit', bookController.updateBookForm)

// manage reader
router.route('/reader')
      .get(readerController.getAllReader)
      .post(readerController.addReader)

router.get('/reader/new', readerController.newReader)

router.route('/reader/:id')
      .get(readerController.getReader)
      .delete(readerController.deleteReader)

router.route('/reader/:id/edit')
      .get(readerController.formEditReader)
      .put(readerController.editReader)

//borow books
router.route('/borrow')
      .get(borrowController.borrowForm)
      .post(borrowController.saveBorrowCard)

router.route('/borrow/confirm')
      .get(borrowController.confirmForm)
      .post(borrowController.updateBorrowForm)

router.route('/fine')
      .get(fineController.getAllFine)
      .post(fineController.saveFine)

router.route('/xacnhantrasach')
      .get(confirmBook.getConfirmReturnBook)
      .put(confirmBook.putConfirmReturnBook)
//manage register-borrow-card
router.route('/register-borrow-card')
      .get(registerBorrowCardController.getAllRegisterBorrowCard)

router.route('/register-borrow-card/delete/:id')
      .delete(registerBorrowCardController.deleteRegisterBorrowCard)

router.route('/register-borrow-card/confirm/:registerBorrowCardId')
      .post(registerBorrowCardController.confirmRegisterBorrowCard)

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
module.exports = router