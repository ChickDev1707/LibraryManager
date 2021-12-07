const Fine = require('../../models/fine')
const Reader = require('../../models/reader')
const {getCurrentUserAccount} = require('../../services/account')

async function getFinePage(req, res){
  let account = await getCurrentUserAccount(req)
  const reader = await Reader.findOne({email: account.ten_tai_khoan})
  const fineCards = await Fine.find({doc_gia: reader._id})
  res.render('reader/fine.ejs', {fineCards})
}

module.exports = {
  getFinePage
}