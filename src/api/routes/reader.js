const express = require('express');
const router = express.Router();
const authController = require('../controllers/librarian/auth.js')

// index
router.route('/').get((req, res)=>{
  res.render('reader/index.ejs')
})
// auth
router.delete('/logout', authController.logOut)

module.exports = router;