const express = require('express');
const router = express.Router();
const userAuth = require('../../middlewares/user-auth.js')

router.delete('/logout', (req, res)=>{ 
  req.logOut()
  res.redirect('/login')
})

module.exports = router;