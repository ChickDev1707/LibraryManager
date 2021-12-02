const registerBorrowCardService = require('../../services/librarian/register-borrow-card-service.js')
const urlHelper = require('../../helpers/url')

// confirm register borrow
async function getConfirmRegisterPage(req, res){
	const registerBorrowCards = await registerBorrowCardService.getUnconfirmedRegisterBorrowCard()
	res.render('librarian/register-borrow-card/confirm-register', {
		registerBorrowCards	
	})
}

async function confirmRegisterBorrowCard(req, res){
	await registerBorrowCardService.createBorrowReturnCard(req.params.id)
	await registerBorrowCardService.updateRegisterBorrowCardStatus(req.params.id, 1)

	const notification = {
    tieu_de: 'Đăng ký thành công',
    noi_dung: `Bạn đã đăng ký mượn sách thành công tại thư viện` 
  }
	await registerBorrowCardService.saveNewNotification(req.params.id, notification)
	var io = req.app.get('socket-io');
  io.emit("reader-new-notification", 'new notification');

	const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/confirm-register-borrow/`, {
		type: 'success',
		message: 'Đã xác nhận phiếu đăng kí mượn sách'
	})
	res.redirect(redirectUrl)
}

async function denyRegisterBorrowCard(req, res){
	await registerBorrowCardService.denyRegisterBorrowCard(req.params.id)

	const notification = {
    tieu_de: 'Đăng ký thất bại',
    noi_dung: `Bạn đã bị hủy phiếu đăng ký` 
  }
	await registerBorrowCardService.saveNewNotification(req.params.id, notification)
	var io = req.app.get('socket-io');
  io.emit("reader-new-notification", 'new notification')

	const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/confirm-register-borrow/`, {
		type: 'success',
		message: 'Đã từ chối phiếu đăng kí mượn sách'
	})
	res.redirect(redirectUrl)
}

module.exports = {
	getConfirmRegisterPage,
	confirmRegisterBorrowCard,
	denyRegisterBorrowCard,
}

