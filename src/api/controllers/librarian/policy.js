
function getPolicyMainPage(req, res){
  res.render('librarian/policy/main.ejs')
}
function getPolicyBookPage(req, res){
  res.render('librarian/policy/book.ejs')
}

function getPolicyBorrowBookPage(req, res){
  res.render('librarian/policy/borrow-book.ejs')
}
function getPolicyFinePage(req, res){
  res.render('librarian/policy/fine.ejs')
}
module.exports ={
  getPolicyMainPage,
  getPolicyBookPage,
  getPolicyBorrowBookPage,
  getPolicyFinePage
}