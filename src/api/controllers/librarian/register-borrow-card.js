const registerBorrowCardService = require('../../services/librarian/register-borrow-card-service.js')

// get all RegisterBorrowCard
async function getAllRegisterBorrowCard(req, res){
    try{
        //delete overdue RegisterBorrowCards
        await registerBorrowCardService.deleteOverdueRegisterBorrowCard()
        //get RegisterBorrowCard
        const registerBorrowCard = await registerBorrowCardService.getAllRegisterBorrowCard()

        res.render('librarian/register-borrow-card/all.ejs', {
            registerBorrowCard: registerBorrowCard
        })
    }catch{
        console.log(error)
        res.redirect('/librarian/register-borrow-card')
    }
}

// delete RegisterBorrowCard
async function deleteRegisterBorrowCard(req, res){
    try{
        await registerBorrowCardService.deleteRegisterBorrowCard(req.params.id)
        
        res.redirect('/librarian/register-borrow-card/')
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

        res.redirect('/librarian/register-borrow-card/')
    }catch{
        res.redirect('/librarian/register-borrow-card')
        console.log(error) 
    }
}

module.exports = {
    getAllRegisterBorrowCard,
    deleteRegisterBorrowCard,
    confirmRegisterBorrowCard
}

