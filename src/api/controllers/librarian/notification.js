const accountServices = require('../../services/account')

async function returnNotifications(req, res){
  let librarianAccount = await accountServices.getLibrarianAccount()
  res.setHeader("Content-Type", "application/json");
  res.statusCode  =  200;
  res.json({
        newNot: librarianAccount.thong_bao_moi,
        notifications: librarianAccount.thong_bao
  });
}
async function clientSideReadNotEvent(req, res){
  if(req.body.newNot){
    accountServices.updateLibrarianAccountNewNotStatus()
  }
}
module.exports = {
  returnNotifications,
  clientSideReadNotEvent
}