
const BorrowReturnCard = require('../../models/borrow-return-card.js')
const dateUtils = require('../../helpers/date.js')

async function searchBorrowCards(searchOptions){
  const borrowCards = await  BorrowReturnCard.find(searchOptions).populate('dau_sach').exec()
  const viewBorrowCards = getViewBorrowCards(borrowCards)
  return viewBorrowCards
}

function getViewBorrowCards(borrowCards){
  const viewBorrowCards = borrowCards.map(card => {
    let borrowDate = new Date(card.ngay_muon)
    let remainDay = 30- dateUtils.dateDiff(borrowDate.getTime(), Date.now())
    card.remainDay = remainDay
    return card
  })
  return viewBorrowCards
}

module.exports = {
  searchBorrowCards
}