const accountServices = require('../../services/account')

async function returnNotifications(req, res){
  let readerAccount = await accountServices.getCurrentUserAccount(req)
  res.setHeader("Content-Type", "application/json");
  res.statusCode  =  200;
  res.json({
    newNot: readerAccount.thong_bao_moi,
    notifications: readerAccount.thong_bao
  });
}
async function clientSideReadNotEvent(req, res){
  if(req.body.newNot){
    const readerAccount = await accountServices.getCurrentUserAccount(req)
    readerAccount.thong_bao_moi = false
    await readerAccount.save()
  }
}
module.exports = {
  returnNotifications,
  clientSideReadNotEvent
}