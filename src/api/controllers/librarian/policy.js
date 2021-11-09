const readerPolicyService = require('../../services/librarian/policy.js')

async function getPolicyMainPage(req, res){
  const readerPolicies = await readerPolicyService.getReaderPolicies()
  res.render('librarian/policy/main.ejs', {readerPolicies})
}
async function updateReaderPolicies(req, res){
  const policiesInput = req.body
  Object.keys(policiesInput).forEach((key, index)=>{policiesInput[key] = Number(policiesInput[key])})
  // parse form field policies to number
  await readerPolicyService.updateReaderPolicies(policiesInput)
  res.redirect('/librarian/policy')
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
  updateReaderPolicies,

  getPolicyBookPage,
  getPolicyBorrowBookPage,
  getPolicyFinePage
}