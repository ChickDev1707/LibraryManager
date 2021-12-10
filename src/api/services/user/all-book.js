const BookHead = require('../../models/book-head')
async function getBooksInPage(pageIndex){
  const numOfBook = 20;
  let start = (pageIndex-1)*numOfBook
  const books = await BookHead.find()
  const limit = Math.ceil(books.length/numOfBook)
  const result = books.slice(start, start+ numOfBook)
  return {books: result, pageLimit: limit }
}
module.exports = {
  getBooksInPage
}