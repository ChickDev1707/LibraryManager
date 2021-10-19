const express = require('express');
const router = express.Router();
const userAuth = require('../../middlewares/user-auth.js')
const docGia=require('../../models/doc_gia')
const taiKhoan=require('../../models/user-account')

router.delete('/logout', async (req, res)=>{
  req.logOut()
  res.redirect('/login')
})

router.get('/doc_gia',async (req,res)=>{
  const search={}
  if(req.query.ho_ten!=null || req.query.ho_ten!=""){
    search.ho_ten=new RegExp(req.query.ho_ten,"i")
  }
  const reader=await docGia.find(search)
  res.render('librarian/all.ejs',{
    docGia:reader,
    search:req.query
  })
})

router.get('/doc_gia/new',async (req,res)=>{
  res.render('librarian/new.ejs',{
    docGia:new docGia(),
    errorMessage:""
})
})

router.post('/doc_gia',async (req,res)=>{
  let reader=""
  if(req.body.ho_ten==""||
      req.body.email==""||
      req.body.gioi_tinh==""||
      req.body.ngay_sinh==""||
      req.body.dia_chi==""||
      req.body.ngay_lap_the==""
  ){
      res.render('librarian/new',{
          docGia:reader,
          errorMessage:"Thiếu thông tin"
      })
  }
  const check=await docGia.find({"email":req.body.email})
  if(check.toString()==''){
    reader=new docGia({
        ho_ten:req.body.ho_ten,
        email:req.body.email,
        gioi_tinh:req.body.gioi_tinh,
        ngay_sinh:req.body.ngay_sinh,
        dia_chi:req.body.dia_chi,
        ngay_lap_the:req.body.ngay_lap_the,
    })
    try {
    const newDocGia= await reader.save()
    res.redirect('/librarian/doc_gia')
    } catch (error) {
        res.render('librarian/new',{
            docGia:reader,
            errorMessage:""
        })
    }

  }else{
    res.render('librarian/new',{
        docGia:reader,
        errorMessage:"Email đã được sử dụng!!!"
    })
  }
})

router.get('/doc_gia/:id',async (req, res) => {
  try {
      const reader=await docGia.findById(req.params.id)
      res.render('librarian/view',{docGia:reader})
  } catch (error) {
      
  }
  
})

router.get('/doc_gia/:id/edit',async(req,res)=>{
  const reader= await docGia.findById(req.params.id)
  const Data={
    id:reader.id,
    ho_ten:reader.ho_ten,
    email:reader.email,
    gioi_tinh:reader.gioi_tinh,
    ngay_sinh:reader.ngay_sinh.toISOString().split('T')[0],
    dia_chi:reader.dia_chi,
    ngay_lap_the:reader.ngay_lap_the.toISOString().split('T')[0],
}
res.render('librarian/edit',{
    docGia:Data,
    error:''
})
})

router.put('/doc_gia/:id/edit',async (req,res)=>{
  let reader= await docGia.findById(req.params.id)
  const check=await docGia.find({"email":req.body.email})
  const Data={
      id:reader.id,
      ho_ten:reader.ho_ten,
      email:reader.email,
      gioi_tinh:reader.gioi_tinh,
      ngay_sinh:reader.ngay_sinh.toISOString().split('T')[0],
      dia_chi:reader.dia_chi,
      ngay_lap_the:reader.ngay_lap_the.toISOString().split('T')[0],
  }
  if(req.body.ho_ten==""||
      req.body.email==""||
      req.body.gioi_tinh==""||
      req.body.ngay_sinh==""||
      req.body.dia_chi==""||
      req.body.ngay_lap_the==""
  ){
      res.render('librarian/edit',{
          docGia:Data,
          error:"Thiếu thông tin"
      })
  }
  else if(check.toString()!=""){

      reader.ho_ten=req.body.ho_ten
      reader.email=req.body.email
      reader.gioi_tinh=req.body.gioi_tinh
      reader.ngay_sinh=req.body.ngay_sinh
      reader.dia_chi=req.body.dia_chi
      reader.ngay_lap_the=req.body.ngay_lap_the
      await reader.save()
      res.redirect('/librarian/doc_gia')             
  
  }else{
      res.render('librarian/edit',{
          docGia:Data,
          error:"Email chưa đăng kí"
      })
  }

})

router.delete('/doc_gia/:id',async (req,res)=>{
  try {
    const reader= await docGia.findById(req.params.id)
    await reader.remove()
    res.redirect('/librarian/doc_gia')
} catch (error) {
    res.redirect('/librarian/doc_gia')
}
})
module.exports = router