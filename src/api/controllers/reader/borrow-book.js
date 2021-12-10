
const borrowBookServices = require('../../services/reader/borrow-book.js')
const accountServices = require('../../services/account.js')
const readerServices = require('../../services/reader/general.js')

async function showViewBorrowCardsPage(req, res){

  const currentUserAccount = await accountServices.getCurrentUserAccount(req)
  const currentReader = await readerServices.getCurrentReader(currentUserAccount.ten_tai_khoan)
  
  let searchOptions = getSearchOptions(currentReader._id, req.query.status)
  let borrowCards = await borrowBookServices.searchBorrowCards(searchOptions)
  res.render('reader/view-borrow.ejs', {borrowCards})
}
function getSearchOptions(readerId, status){
  let searchOptions = {ma_doc_gia: readerId}
  let reqStatus = status == undefined? -1: Number(status)
  if(reqStatus == 1) searchOptions.ngay_tra = null
  else if(reqStatus == 2) searchOptions.ngay_tra = {$ne: null}
  return searchOptions
}

module.exports = {
  showViewBorrowCardsPage
}