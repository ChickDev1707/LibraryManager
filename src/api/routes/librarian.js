const express = require('express');
const router = express.Router();
const authController = require('../controllers/librarian/auth.js');
const bookController = require('../controllers/librarian/manage-book')

const bookMiddleWares = require('../middlewares/book-check')

// index
router.route('/').get((req, res)=>{
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