const searchBookService = require('../../services/user/search-book-service.js')
const Reader = require('../../models/reader')
const urlHelper = require('../../helpers/url')

//autocomplete search

async function autocompleteSearch(req, res){
    try{
        await searchBookService.autocompleteSearch(req, res)
    }catch(error){
        res.redirect('/')
        console.log(error)
    }
}

//search book 
async function searchBook(req, res) {
    try {
        const bookHeads = await searchBookService.searchBook(req.query.searchBox, req.query.option)
        res.render(req.userPage, {
            bookHeads: bookHeads,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
        console.log(error)
    }
}

//show book details page
async function showBookDetail(req, res) {
    try {
        const user = await req.user
        const bookDetailView = getBookDetailView(user)
        const bookHead = await searchBookService.showBookDetail(req.params.id)

        const data = {
            bookHead: bookHead,
            errorMessage: req.query.errorMessage
        }
        if(bookDetailView == "reader/book-detail.ejs"){
            const readerCard = await Reader.findOne({id_account: user.id})
            data.readerId = readerCard.id
        }
        res.render(bookDetailView, data)

        //res.json(user)
    } catch (error) {
        res.redirect('/')
        console.log(error)
    }
}

function getBookDetailView(user) {
    let viewDir;
    if (user != undefined) {
        if (user.vai_tro == "librarian") viewDir = "librarian/book-detail.ejs"
        else if (user.vai_tro == "reader") viewDir = "reader/book-detail.ejs"
    } else viewDir = "user/book-detail.ejs"
    return viewDir;
}

//comment book
const accountService = require('../../services/account')
const readerService = require('../../services/reader/general')



async function comment(req, res) {
    const currentAccount = await accountService.getCurrentUserAccount(req)
    if (!currentAccount) {
        console.log("b???n ch??a ????ng nh???p")
        res.redirect('/login')
        return
    }
    if (currentAccount.vai_tro == 'librarian') {
        console.log("b???n ??ang l?? th??? th?? m?? !")
        res.redirect('back')
        return
    }
    try {
        const currentReader = await readerService.getCurrentReader(currentAccount.ten_tai_khoan)
        if (req.body.commentInput != null && req.body.commentInput != '') {
            var result = await searchBookService.comment(currentReader._id, req.params.bookHeadId, req.body.commentInput, req.body.voteStart)
            //console.log("result = " + result)
            if (result == "???? b??nh lu???n") {
                const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${req.params.bookHeadId}`, {
                    type: 'info',
                    message: 'B???n ???? nh???n x??t cu???n s??ch n??y r???i'
                  })
                  res.redirect(redirectUrl)
            } else if(result == "Th??nh c??ng"){
                const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${req.params.bookHeadId}`, {
                    type: 'success',
                    message: 'Nh???n x??t s??ch th??nh c??ng'
                  })
                  res.redirect(redirectUrl)
            }else{
                res.redirect('back')
            }
        }else{
            res.redirect('back')
        }
    } catch (error) {
        console.log(error)
        res.redirect('back')
    }
}

async function editComment(req, res) {
    const currentAccount = await accountService.getCurrentUserAccount(req)
    if (!currentAccount) {
        console.log("b???n ch??a ????ng nh???p")
        res.redirect('/login')
        return
    }
    if (currentAccount.vai_tro == 'librarian') {
        console.log("b???n ??ang l?? th??? th?? m?? !")
        res.redirect('back')
        return
    }
    try {
        const currentReader = await readerService.getCurrentReader(currentAccount.ten_tai_khoan)
        if (req.body.commentInput != null && req.body.commentInput != '') {
            var result = await searchBookService.editComment(req.params.bookHeadId,req.body.commentId, req.body.commentInput, req.body.voteStart)
            //console.log("result = " + result)
            if (result == "Th??nh c??ng") {
                const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${req.params.bookHeadId}`, {
                    type: 'success',
                    message: 'C???p nh???p nh???n x??t th??nh c??ng!'
                  })
                  res.redirect(redirectUrl)
            } else{
                res.redirect('back')
            }
        }else{
            res.redirect('back')
        }
    } catch (error) {
        console.log(error)
        res.redirect('back')
    }
}

async function deleteComment(req, res){
    try {
        var result = await searchBookService.deleteComment(req.params.bookHeadId, req.body.commentId)
        if (result == "Th??nh c??ng") {
            const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${req.params.bookHeadId}`, {
                type: 'success',
                message: 'X??a nh???n x??t th??nh c??ng!'
              })
              res.redirect(redirectUrl)
        } else{
            res.redirect('back')
        }
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    searchBook,
    showBookDetail,
    comment,
    autocompleteSearch,
    editComment,
    deleteComment
}