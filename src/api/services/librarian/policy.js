const Policy = require('../../models/policy')
const BookCategory = require('../../models/book-category')
// reader
async function getReaderPolicies(){
  const minAge = await getPolicyByName('tuoi_toi_thieu')
  const maxAge = await getPolicyByName('tuoi_toi_da')
  const cardExpireLimit = await getPolicyByName('thoi_han_the')
  const val = getPolicyValue(minAge)
  return {
    minAge: getPolicyValue(minAge), 
    maxAge: getPolicyValue(maxAge),
    cardExpireLimit: getPolicyValue(cardExpireLimit)
  }
}

async function updateReaderPolicies(policiesInput){
  await handleUpdateMinAgePolicy(policiesInput.minAge)
  await handleUpdateMaxAgePolicy(policiesInput.maxAge)
  await handleUpdateCardExpireLimitAgePolicy(policiesInput.cardExpireLimit)
}
async function handleUpdateMinAgePolicy(minAgeInput){
  let minAgePol = await getPolicyByName('tuoi_toi_thieu')
  if(minAgePol == null){
    minAgePol = new Policy({ten_quy_dinh: 'tuoi_toi_thieu', gia_tri: minAgeInput})
  }else{
    minAgePol.gia_tri = minAgeInput
  }
  await minAgePol.save()
}
async function handleUpdateMaxAgePolicy(maxAgeInput){
  let maxAgePol = await getPolicyByName('tuoi_toi_da')
  if(maxAgePol == null){
    maxAgePol = new Policy({ten_quy_dinh: 'tuoi_toi_da', gia_tri: maxAgeInput})
  }else{
    maxAgePol.gia_tri = maxAgeInput
  }
  await maxAgePol.save()
}
async function handleUpdateCardExpireLimitAgePolicy(cardExpireLimitInput){
  let cardExpireLimit = await getPolicyByName('thoi_han_the')
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
  const borrowLimit = await getPolicyByName('thoi_han_muon_sach')
  const maxAllowedBorrowBook = await getPolicyByName('so_sach_muon_toi_da')
  return {
    borrowLimit: getPolicyValue(borrowLimit), 
    maxAllowedBorrowBook: getPolicyValue(maxAllowedBorrowBook),
  }
}

async function updateBorrowBookPolicies(policiesInput){
  await handleUpdateBorrowLimitPolicy(policiesInput.borrowLimit)
  await handleUpdateMaxAllowedBorrowBookPolicy(policiesInput.maxAllowedBorrowBook)
}
async function handleUpdateBorrowLimitPolicy(borrowLimit){
  let borrowLimitPol = await getPolicyByName('thoi_han_muon_sach')
  if(borrowLimitPol == null){
    borrowLimitPol = new Policy({ten_quy_dinh: 'thoi_han_muon_sach', gia_tri: borrowLimit})
  }else{
    borrowLimitPol.gia_tri = borrowLimit
  }
  await borrowLimitPol.save()
}
async function handleUpdateMaxAllowedBorrowBookPolicy(maxAllowedBorrowBook){
  let maxAllowedBorrowBookPol = await getPolicyByName('so_sach_muon_toi_da')
  if(maxAllowedBorrowBookPol == null){
    maxAllowedBorrowBookPol = new Policy({ten_quy_dinh: 'so_sach_muon_toi_da', gia_tri: maxAllowedBorrowBook})
  }else{
    maxAllowedBorrowBookPol.gia_tri = maxAllowedBorrowBook
  }
  await maxAllowedBorrowBookPol.save()
}

// fine
async function getFinePolicies(){
  const fineMoneyAmount = await getPolicyByName('so_tien_phat')
  const maxAllowedDebt = await getPolicyByName('tien_no_toi_da')
  return {
    fineMoneyAmount: getPolicyValue(fineMoneyAmount), 
    maxAllowedDebt: getPolicyValue(maxAllowedDebt),
  } 
}
async function updateFinePolicies(policiesInput){
  handleUpdateFineMoneyAmountPolicy(policiesInput.fineMoneyAmount)
  handleUpdatemaxAllowedDebtPolicy(policiesInput.maxAllowedDebt)
}
async function handleUpdateFineMoneyAmountPolicy(fineAmount){
  let findMoneyAmountPol = await getPolicyByName('so_tien_phat')
  if(findMoneyAmountPol == null){
    findMoneyAmountPol = new Policy({ten_quy_dinh: 'so_tien_phat', gia_tri: fineAmount})
  }else{
    findMoneyAmountPol.gia_tri = fineAmount
  }
  await findMoneyAmountPol.save()
}
async function handleUpdatemaxAllowedDebtPolicy(maxAllowedDebt){
  let maxAllowedDebtPol = await getPolicyByName('tien_no_toi_da')
  if(maxAllowedDebtPol == null){
    maxAllowedDebtPol = new Policy({ten_quy_dinh: 'tien_no_toi_da', gia_tri: maxAllowedDebt})
  }else{
    maxAllowedDebtPol.gia_tri = maxAllowedDebt
  }
  await maxAllowedDebtPol.save()
}
// util
async function getPolicyByName(name){
  const pol = await Policy.findOne({ten_quy_dinh: name})
  return pol
}
async function getPolicyValueByName(name){
  const pol = await Policy.findOne({ten_quy_dinh: name})
  return Number(pol.gia_tri)
}
function getPolicyValue(pol){
  return pol != null? pol.gia_tri: ''
}
module.exports={
  getReaderPolicies,
  updateReaderPolicies,

  getBookCategories,
  addNewBookCategory,
  editBookCategory,
  deleteBookCategory,

  getBorrowBookPolicies,
  updateBorrowBookPolicies,

  getFinePolicies,
  updateFinePolicies,

  getPolicyByName,
  getPolicyValueByName
  // utility for other feature
}