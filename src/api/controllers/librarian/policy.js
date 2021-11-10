const policyService = require('../../services/librarian/policy.js')

//reader
async function getPolicyMainPage(req, res){
  const readerPolicies = await policyService.getReaderPolicies()
  res.render('librarian/policy/main.ejs', {readerPolicies})
}
async function updateReaderPolicies(req, res){
  const policiesInput = req.body
  Object.keys(policiesInput).forEach((key, index)=>{policiesInput[key] = Number(policiesInput[key])})
  // parse form field policies to number
  await policyService.updateReaderPolicies(policiesInput)
  res.redirect('/librarian/policy')
}
//book category
async function getPolicyCategoryPage(req, res){
  const bookCategories = await policyService.getBookCategories()
  res.render('librarian/policy/book-category.ejs', {bookCategories})
}
// add
async function addNewBookCategory(req, res){
  const categoryName = req.body.categoryName
  await policyService.addNewBookCategory(categoryName)
  res.redirect('/librarian/policy/book-category')
}
// edit
async function editBookCategory(req, res){
  const category = {
    id: req.params['id'],
    name: req.body.categoryName
  }
  await policyService.editBookCategory(category)
  res.redirect('/librarian/policy/book-category')
}
async function deleteBookCategory(req, res){
  const categoryId = req.params['id']
  await policyService.deleteBookCategory(categoryId)
  res.redirect('/librarian/policy/book-category')
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

  getPolicyCategoryPage,
  addNewBookCategory,
  editBookCategory,
  deleteBookCategory,
  
  getPolicyBorrowBookPage,
  getPolicyFinePage
}