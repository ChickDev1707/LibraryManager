const express = require('express');
const router = express.Router();

const authController = require('../controllers/librarian/auth.js');
const bookController = require('../controllers/librarian/manage-book.js')
const bookRegistrationController = require('../controllers/librarian/book-registration.js')
const bookMiddleWares = require('../middlewares/book-check')
const userAuth = require('../middlewares/user-auth.js')

const readerController=require('../controllers/librarian/manage-reader')
// index
router.route('/').get(userAuth.checkAuthenticatedAsLibrarian)
// auth
router.delete('/logout', authController.logOut)

// manage-book
router.route('/books')
      .get(bookController.all)
      .post(bookController.upload.single('anh_bia'), bookMiddleWares.checkNewBook, bookController.saveBook)

router.get('/books/new', bookController.newBookForm)

router.route('/books/:id')
      .get(bookController.bookDetail)
      .put(bookController.upload.single('anh_bia'), bookMiddleWares.checkUpdateBook, bookController.updateBook)
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

// manage book registration
router.route('/book-registration')
      .get(bookRegistrationController.getAllBookRegistration)

router.route('/book-registration/delete/:id')
      .delete(bookRegistrationController.deleteBookRegistration)

router.route('/book-registration/confirm/:bookRegistrationId')
      .post(bookRegistrationController.confirmBookRegistration)


module.exports = router