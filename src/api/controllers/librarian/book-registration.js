const bookRegistrationService = require('../../services/librarian/book-registration-service.js')

// get all book-registration
async function getAllBookRegistration(req, res){
    try{
        //delete overdue book-registrations
        await bookRegistrationService.deleteOverdueBookRegistration()
        //get book-registrations
        const bookRegistration = await bookRegistrationService.getAllBookRegistration()

        res.render('librarian/book-registration/all.ejs', {
            bookRegistration: bookRegistration
        })
    }catch{
        console.log(error)
        res.redirect('/librarian/book-registration')
    }
}

// delete book-registration
async function deleteBookRegistration(req, res){
    try{
        await bookRegistrationService.deleteBookRegistration(req.params.id)
        
        res.redirect('/librarian/book-registration/')
    }catch{
        console.log(error)
        res.redirect('/librarian/book-registration/')
    }
}
// confirm book-registration 
async function confirmBookRegistration(req, res){
    try{
        //create book-registration
        await bookRegistrationService.createBorrowReturnCard(req.params.bookRegistrationId)
        // update book-registration status
        await bookRegistrationService.updateBookRegistrationStatus(req.params.bookRegistrationId)

        res.redirect('/librarian/book-registration/')
    }catch{
        res.redirect('/librarian/book-registration')
        console.log(error) 
    }
}

module.exports = {
    getAllBookRegistration,
    deleteBookRegistration,
    confirmBookRegistration
}

