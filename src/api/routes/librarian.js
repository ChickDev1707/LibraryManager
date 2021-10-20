const express = require('express');
const router = express.Router();
const authController = require('../controllers/librarian/auth.js')
const userAuth = require('../middlewares/user-auth.js')

const authController = require('../controllers/librarian/auth.js')
const readerController=require('../controllers/librarian/manage-reader')
// index
router.route('/').get(userAuth.checkAuthenticatedAsLibrarian, (req, res)=>{
  res.render('librarian/index.ejs')
})
// auth
router.delete('/logout', authController.logOut)

router.get('/doc_gia',readerController.getAllReader)

router.get('/doc_gia/new',readerController.newReader)

router.post('/doc_gia',readerController.addReader)

router.get('/doc_gia/:id',readerController.getReader)

router.get('/doc_gia/:id/edit',readerController.formEditReader)

router.put('/doc_gia/:id/edit',readerController.editReader)

router.delete('/doc_gia/:id',readerController.deleteReader)

module.exports = router

