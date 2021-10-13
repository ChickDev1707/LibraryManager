const express = require('express');
const router = express.Router();
const userAuth = require('../middlewares/user-auth.js')

router.get('/', userAuth.decideUserPage, async (req, res)=>{
  try{   
    res.render(req.userPage)
  }catch{
    console.log("error")
  }
})

module.exports = router;