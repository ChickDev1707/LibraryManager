const {
	getUnconfirmedRegisterBorrowCard,
  updateRegisterBorrowCardStatus,
  createBorrowReturnCard,
  handelDenyRegisterBorrowCard,
	saveNewNotification,
	sendNotificationByMail
} = require('../../services/librarian/register-borrow-card-service.js')
const urlHelper = require('../../helpers/url')

// confirm register borrow
async function getConfirmRegisterPage(req, res){
	const registerBorrowCards = await getUnconfirmedRegisterBorrowCard()
	res.render('librarian/register-borrow-card/confirm-register', {
		registerBorrowCards	
	})
}

async function confirmRegisterBorrowCard(req, res){
	await createBorrowReturnCard(req.params.id)
	await updateRegisterBorrowCardStatus(req.params.id, 1)
	await sendConfirmRegisterBorrowNotification(req)
	await sendConfirmRegisterBorrowNotificationByMail(req.params.id)
	respondConfirmRegisterBorrow(res)
}
async function sendConfirmRegisterBorrowNotification(req){
	const notification = {
    tieu_de: 'Đăng ký thành công',
    noi_dung: `Bạn đã đăng ký mượn sách thành công tại thư viện` 
  }
	await sendReaderNotification(req, notification)
}
async function sendConfirmRegisterBorrowNotificationByMail(registerBorrowCardId){
	const message={
		subject: "Đăng ký mượn sách thành công",
		html: "Bạn đã đăng ký mượn sách thành công tại thư viện"
	}
	sendNotificationByMail(registerBorrowCardId, message)
}
function respondConfirmRegisterBorrow(res){
	const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/confirm-register-borrow/`, {
		type: 'success',
		message: 'Đã xác nhận phiếu đăng kí mượn sách'
	})
	res.redirect(redirectUrl)
}

async function denyRegisterBorrowCard(req, res){
	await handelDenyRegisterBorrowCard(req.params.id)
	await sendDenyRegisterBorrowNotification(req)
	await sendDenyRegisterBorrowNotificationByMail(req.params.id)
	respondDenyRegisterBorrow(res)
}
async function sendDenyRegisterBorrowNotification(req){
	const notification = {
    tieu_de: 'Đăng ký thất bại',
    noi_dung: `Bạn đã bị hủy phiếu đăng ký` 
  }
	await sendReaderNotification(req, notification)
}
async function sendDenyRegisterBorrowNotificationByMail(registerBorrowCardId){
	const message={
		subject: "Đăng ký mượn sách thất bại",
		html: "Yêu cầu đăng ký của bạn đã bị hủy"
	}
	sendNotificationByMail(registerBorrowCardId, message)
}
function respondDenyRegisterBorrow(res){
	const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/confirm-register-borrow/`, {
		type: 'success',
		message: 'Đã từ chối phiếu đăng kí mượn sách'
	})
	res.redirect(redirectUrl)
}

async function sendReaderNotification(req, notification){
	await saveNewNotification(req.params.id, notification)
	var io = req.app.get('socket-io');
  io.emit("reader-new-notification", 'new notification');
}
module.exports = {
	getConfirmRegisterPage,
	confirmRegisterBorrowCard,
	denyRegisterBorrowCard,
}

