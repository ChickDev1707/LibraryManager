const Account = require('../models/user-account.js')

async function getCurrentUserAccount(req){
  const user = await req.user
  const currentUserAccount = await Account.findById(user._id)
  return currentUserAccount
}

module.exports = {
  getCurrentUserAccount
}