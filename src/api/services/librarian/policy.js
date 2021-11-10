const Policy = require('../../models/policy')
const BookCategory = require('../../models/book-category')
// reader
async function getReaderPolicies(){
  const minAge = await Policy.findOne({ten_quy_dinh: 'tuoi_toi_thieu'})
  const maxAge = await Policy.findOne({ten_quy_dinh: 'tuoi_toi_da'})
  const cardExpireLimit = await Policy.findOne({ten_quy_dinh: 'thoi_han_the'})
  return {
    minAge: minAge != null? minAge.gia_tri: '', 
    maxAge: maxAge != null? maxAge.gia_tri: '',
    cardExpireLimit: cardExpireLimit != null? cardExpireLimit.gia_tri: ''
  }
}

async function updateReaderPolicies(policiesInput){
  await handleUpdateMinAgePolicy(policiesInput.minAge)
  await handleUpdateMaxAgePolicy(policiesInput.maxAge)
  await handleUpdateCardExpireLimitAgePolicy(policiesInput.cardExpireLimit)
}
async function handleUpdateMinAgePolicy(minAgeInput){
  let minAgePol = await Policy.findOne({ten_quy_dinh: 'tuoi_toi_thieu'})
  if(minAgePol == null){
    minAgePol = new Policy({ten_quy_dinh: 'tuoi_toi_thieu', gia_tri: minAgeInput})
  }else{
    minAgePol.gia_tri = minAgeInput
  }
  await minAgePol.save()
}
async function handleUpdateMaxAgePolicy(maxAgeInput){
  let maxAgePol = await Policy.findOne({ten_quy_dinh: 'tuoi_toi_da'})
  if(maxAgePol == null){
    maxAgePol = new Policy({ten_quy_dinh: 'tuoi_toi_da', gia_tri: maxAgeInput})
  }else{
    maxAgePol.gia_tri = maxAgeInput
  }
  await maxAgePol.save()
}
async function handleUpdateCardExpireLimitAgePolicy(cardExpireLimitInput){
  let cardExpireLimit = await Policy.findOne({ten_quy_dinh: 'thoi_han_the'})
  if(cardExpireLimit == null){
    cardExpireLimit = new Policy({ten_quy_dinh: 'thoi_han_the', gia_tri: cardExpireLimitInput})
  }else{
    cardExpireLimit.gia_tri = cardExpireLimitInput
  }
  await cardExpireLimit.save()
}
// book category
async function getBookCategories(){
  const bookCategories = await BookCategory.find({})
  return bookCategories
}
// add
async function addNewBookCategory(categoryName){
  const newCat = new BookCategory({ten_the_loai: categoryName})
  await newCat.save()
}
// edit
async function editBookCategory(category){
  let dbCategory = await BookCategory.findById(category.id)
  dbCategory.ten_the_loai = category.name
  await dbCategory.save()
}
// delete
async function deleteBookCategory(categoryId){
  let dbCategory = await BookCategory.findById(categoryId)
  await dbCategory.remove()
}

// borrow book
async function getBorrowBookPolicies(){
  const borrowLimit = await Policy.findOne({ten_quy_dinh: 'thoi_han_muon_sach'})
  const maxAllowedBorrowBook = await Policy.findOne({ten_quy_dinh: 'so_sach_muon_toi_da'})
  return {
    borrowLimit: borrowLimit != null? borrowLimit.gia_tri: '', 
    maxAllowedBorrowBook: maxAllowedBorrowBook != null? maxAllowedBorrowBook.gia_tri: '',
  }
}

async function updateBorrowBookPolicies(policiesInput){
  await handleUpdateBorrowLimitPolicy(policiesInput.borrowLimit)
  await handleUpdateMaxAllowedBorrowBookPolicy(policiesInput.maxAllowedBorrowBook)
}
async function handleUpdateBorrowLimitPolicy(borrowLimit){
  let borrowLimitPol = await Policy.findOne({ten_quy_dinh: 'thoi_han_muon_sach'})
  if(borrowLimitPol == null){
    borrowLimitPol = new Policy({ten_quy_dinh: 'thoi_han_muon_sach', gia_tri: borrowLimit})
  }else{
    borrowLimitPol.gia_tri = borrowLimit
  }
  await borrowLimitPol.save()
}
async function handleUpdateMaxAllowedBorrowBookPolicy(maxAllowedBorrowBook){
  let maxAllowedBorrowBookPol = await Policy.findOne({ten_quy_dinh: 'so_sach_muon_toi_da'})
  if(maxAllowedBorrowBookPol == null){
    maxAllowedBorrowBookPol = new Policy({ten_quy_dinh: 'so_sach_muon_toi_da', gia_tri: maxAllowedBorrowBook})
  }else{
    maxAllowedBorrowBookPol.gia_tri = maxAllowedBorrowBook
  }
  await maxAllowedBorrowBookPol.save()
}


module.exports={
  getReaderPolicies,
  updateReaderPolicies,

  getBookCategories,
  addNewBookCategory,
  editBookCategory,
  deleteBookCategory,

  getBorrowBookPolicies,
  updateBorrowBookPolicies
}