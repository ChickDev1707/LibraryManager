const express = require('express');

const router = express.Router();

router.get('/', async (req, res)=>{
    try{   
        res.render('index.ejs')
    }catch{
        console.log("error")
    }
})

module.exports = router;