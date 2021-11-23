const registerBorrowCardService = require('../../services/librarian/register-borrow-card-service.js')
const urlHelper = require('../../helpers/url')

// get all RegisterBorrowCard
async function getAllRegisterBorrowCard(req, res){
    try{
        //deny overdue RegisterBorrowCards
        await registerBorrowCardService.denyOverdueRegisterBorrowCard()

        //get RegisterBorrowCard
        const registerBorrowCard = await registerBorrowCardService.getAllRegisterBorrowCard()

        res.render('librarian/register-borrow-card/all.ejs', {
            registerBorrowCard: registerBorrowCard
        })

    }catch{
        console.log(error)
        res.redirect('back')
    }
}

// deny RegisterBorrowCard
async function denyRegisterBorrowCard(req, res){
    try{
        await registerBorrowCardService.denyRegisterBorrowCard(req.params.id)

        const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/register-borrow-card/`, {
            type: 'success',
            message: 'Đã từ chối phiếu đăng kí mượn sách'
        })
        res.redirect(redirectUrl)

    }catch{
        console.log(error)
        res.redirect('/librarian/register-borrow-card/')
    }
}

// confirm RegisterBorrowCard
async function confirmRegisterBorrowCard(req, res){
    try{
        //create RegisterBorrowCard
        await registerBorrowCardService.createBorrowReturnCard(req.params.registerBorrowCardId)
        // update RegisterBorrowCard status
        await registerBorrowCardService.updateRegisterBorrowCardStatus(req.params.registerBorrowCardId)

        const redirectUrl = urlHelper.getEncodedMessageUrl(`/librarian/register-borrow-card/`, {
            type: 'success',
            message: 'Đã xát nhận phiếu đăng kí mượn sách'
        })
        res.redirect(redirectUrl)
        
    }catch{
        res.redirect('/librarian/register-borrow-card')
        console.log(error) 
    }
}

module.exports = {
    getAllRegisterBorrowCard,
    denyRegisterBorrowCard,
    confirmRegisterBorrowCard
}

