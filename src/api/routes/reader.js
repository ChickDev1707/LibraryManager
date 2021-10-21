const express = require('express');
const router = express.Router();
const authController = require('../controllers/librarian/auth.js')
const userAuth = require('../middlewares/user-auth.js')

// index
router.route('/').get(userAuth.checkAuthenticatedAsReader, (req, res)=>{
  res.render('reader/index.ejs')
})
// auth
router.delete('/logout', authController.logOut)

module.exports = router;