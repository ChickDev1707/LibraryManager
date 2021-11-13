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
const path=require('path')
const {upload} = require('../services/librarian/manage-book-service')

const multer=require('multer')

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
const uploadPath = path.join('./src/public', '/uploads/addReader')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })

const uploadReader = multer({ storage: storage })


router.route('/reader')
      .get(readerController.getAllReader)
      .post(uploadReader.single('uploadfile'),readerController.addReader)

//
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

router.route('/register-borrow-card/deny/:id')
      .put(registerBorrowCardController.denyRegisterBorrowCard)

router.route('/register-borrow-card/confirm/:registerBorrowCardId')
      .post(registerBorrowCardController.confirmRegisterBorrowCard)

//report
router.route('/month-report')
      .get(reportController.getMonthReportPage)
      
router.route('/day-report')
      .get(reportController.getDayReportPage)

module.exports = router