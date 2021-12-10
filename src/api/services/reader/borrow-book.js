
const BorrowReturnCard = require('../../models/borrow-return-card.js')
const dateUtils = require('../../helpers/date.js')
const policyServices = require('../../services/librarian/policy.js')

async function searchBorrowCards(searchOptions){
  const borrowCards = await  BorrowReturnCard.find(searchOptions).populate('dau_sach').exec()
  const viewBorrowCards = getViewBorrowCards(borrowCards)
  return viewBorrowCards
}

async function getViewBorrowCards(borrowCards){
  const borrowLimit = await policyServices.getPolicyValueByName('thoi_han_muon_sach')
  const viewBorrowCards = borrowCards.map(card => {
    let borrowDate = new Date(card.ngay_muon)
    let remainDay = borrowLimit- dateUtils.dateDiff(borrowDate.getTime(), Date.now())
    card.remainDay = remainDay
    return card
  })
  return viewBorrowCards
}

module.exports = {
  searchBorrowCards
}