const express = require('express');
const router = express.Router();

const authController = require('../controllers/librarian/auth.js');
const bookController = require('../controllers/librarian/manage-book')

const bookMiddleWares = require('../middlewares/book-check')
const userAuth = require('../middlewares/user-auth.js')


const readerController=require('../controllers/librarian/manage-reader')
// index
router.route('/').get(userAuth.checkAuthenticatedAsLibrarian, (req, res)=>{
  res.render('librarian/index.ejs')
})
// auth
router.delete('/logout', authController.logOut)

//all book
router.get('/books', bookController.all)


//new book
router.get('/books/new', bookController.newBookForm)

//book detail
router.get('/books/:id', bookController.bookDetail)


//edit book
router.get('/books/:id/edit', bookController.updateBookForm)

//save new book
router.post('/books',bookController.upload.single('anh_bia'), bookMiddleWares.checkNewBook, bookController.saveBook)

//Update book
router.put('/books/:id', bookController.upload.single('anh_bia'), bookMiddleWares.checkUpdateBook, bookController.updateBook)

//Delete book
router.delete('/books/:id', bookController.deleteBook)

module.exports = router;
=======
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


module.exports = router

