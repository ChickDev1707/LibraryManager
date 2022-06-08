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
        console.log("bạn chưa đăng nhập")
        res.redirect('/login')
        return
    }
    if (currentAccount.vai_tro == 'librarian') {
        console.log("bạn đang là thủ thư mà !")
        res.redirect('back')
        return
    }
    try {
        const currentReader = await readerService.getCurrentReader(currentAccount.ten_tai_khoan)
        if (req.body.commentInput != null && req.body.commentInput != '') {
            var result = await searchBookService.comment(currentReader._id, req.params.bookHeadId, req.body.commentInput, req.body.voteStart)
            //console.log("result = " + result)
            if (result == "Đã bình luận") {
                const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${req.params.bookHeadId}`, {
                    type: 'info',
                    message: 'Bạn đã nhận xét cuốn sách này rồi'
                  })
                  res.redirect(redirectUrl)
            } else if(result == "Thành công"){
                const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${req.params.bookHeadId}`, {
                    type: 'success',
                    message: 'Nhận xét sách thành công'
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
        console.log("bạn chưa đăng nhập")
        res.redirect('/login')
        return
    }
    if (currentAccount.vai_tro == 'librarian') {
        console.log("bạn đang là thủ thư mà !")
        res.redirect('back')
        return
    }
    try {
        const currentReader = await readerService.getCurrentReader(currentAccount.ten_tai_khoan)
        if (req.body.commentInput != null && req.body.commentInput != '') {
            var result = await searchBookService.editComment(req.params.bookHeadId,req.body.commentId, req.body.commentInput, req.body.voteStart)
            //console.log("result = " + result)
            if (result == "Thành công") {
                const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${req.params.bookHeadId}`, {
                    type: 'success',
                    message: 'Cập nhập nhận xét thành công!'
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
        if (result == "Thành công") {
            const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${req.params.bookHeadId}`, {
                type: 'success',
                message: 'Xóa nhận xét thành công!'
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