const policyService = require('../../services/librarian/policy.js')
const urlHelper = require('../../helpers/url.js')

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
  const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/policy/`, {
    type: 'success',
    message: 'Cập nhật quy định độc giả thành công'
  })
  res.redirect(redirectUrl)
}
//book category
async function getPolicyCategoryPage(req, res){
  const bookCategories = await policyService.getBookCategories()
  res.render('librarian/policy/book-category.ejs', {bookCategories})
}
// add
async function addNewBookCategory(req, res){
  try{
    const categoryName = req.body.categoryName
    await policyService.addNewBookCategory(categoryName)
    res.redirect('/librarian/policy/book-category')
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/policy/book-category/`, {
      type: 'success',
      message: 'Đã thêm thể loại sách vào thư viện'
    })
    res.redirect(redirectUrl)
  }catch(e){
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/policy/book-category/`, {
      type: 'error',
      message: e
    })
    res.redirect(redirectUrl)
  }
}
// edit
async function editBookCategory(req, res){
  try{
    const category = {
      id: req.params['id'],
      name: req.body.categoryName
    }
    await policyService.editBookCategory(category)
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/policy/book-category/`, {
      type: 'success',
      message: 'Đã cập nhật thể loại sách'
    })
    res.redirect(redirectUrl)

  }catch(e){
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/policy/book-category/`, {
      type: 'error',
      message: e
    })
    res.redirect(redirectUrl)
  }
}
// delete
async function deleteBookCategory(req, res){
  try{
    const categoryId = req.params['id']
    await policyService.deleteBookCategory(categoryId)
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/policy/book-category/`, {
      type: 'success',
      message: 'Đã xóa thể loại sách khỏi thư viện'
    })
    res.redirect(redirectUrl)
  }catch(e){
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/policy/book-category/`, {
      type: 'error',
      message: e
    })
    res.redirect(redirectUrl)
  }
}

// borrow book
async function getPolicyBorrowBookPage(req, res){
  const borrowBookPolicies = await policyService.getBorrowBookPolicies()
  res.render('librarian/policy/borrow-book.ejs', {borrowBookPolicies})
}
async function updatePolicyBorrowBook(req, res){
  const policiesInput = req.body
  Object.keys(policiesInput).forEach((key, index)=>{policiesInput[key] = Number(policiesInput[key])})
  // parse form field policies to number
  await policyService.updateBorrowBookPolicies(policiesInput)
  const redirectUrl = urlHelper.getEncodedMessageUrl(`/reader/policy/borrow-book`, {
    type: 'success',
    message: 'Cập nhật quy định mượn sách thành công'
  })
  res.redirect(redirectUrl)
}

// fine

async function getPolicyFinePage(req, res){
  const finePolicies = await policyService.getFinePolicies()
  res.render('librarian/policy/fine.ejs', {finePolicies})
}
async function updateFinePolicies(req, res){
  const policiesInput = req.body
  Object.keys(policiesInput).forEach((key, index)=>{policiesInput[key] = Number(policiesInput[key])})
  
  await policyService.updateFinePolicies(policiesInput)
  const redirectUrl = urlHelper.getEncodedMessageUrl(`/reader/policy/fine`, {
    type: 'success',
    message: 'Cập nhật quy định tiền phạt thành công'
  })
  res.redirect(redirectUrl)
}
module.exports ={
  getPolicyMainPage,
  updateReaderPolicies,

  getPolicyCategoryPage,
  addNewBookCategory,
  editBookCategory,
  deleteBookCategory,
  
  getPolicyBorrowBookPage,
  updatePolicyBorrowBook,

  getPolicyFinePage,
  updateFinePolicies
}