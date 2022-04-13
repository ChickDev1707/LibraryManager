const Account = require("../models/user-account.js");

async function getCurrentUserAccount(req) {
  if (!req.user) {
    return null;
  }
  const user = await req.user;
  const currentUserAccount = await Account.findById(user._id);
  return currentUserAccount;
}

async function getLibrarianAccount() {
  const librarianAccount = await Account.findOne({ vai_tro: "librarian" });
  return librarianAccount;
}

async function updateLibrarianAccountNewNotStatus() {
  let librarianAccount = await getLibrarianAccount();
  librarianAccount.thong_bao_moi = false;
  await librarianAccount.save();
}
module.exports = {
  getCurrentUserAccount,
  getLibrarianAccount,
  updateLibrarianAccountNewNotStatus,
};
