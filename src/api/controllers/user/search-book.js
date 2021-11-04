const searchBookService = require('../../services/user/search-book-service.js')

//search book 
async function searchBook(req, res){
    try{
        const bookHeads = await searchBookService.searchBook(req.query.searchBox, req.query.option)
 
        res.render(req.userPage, {
            bookHeads: bookHeads,
            searchOptions: req.query
        })
    }catch(error){
        res.redirect('/')
        console.log(error)
    }
}

//show book details page
async function showBookDetail(req, res){
    try {
        const {bookHead, comment} = await searchBookService.showBookDetail(req.params.id)

        res.render('user/book-detail.ejs', { 
            bookHead: bookHead, 
            comment: comment
        })
    } catch(error){
      res.redirect('/')
      console.log(error)
    }
}

//comment book
async function comment(req, res){
    try{
        if(req.body.commentInput != null){
            await searchBookService.comment(req.params.id, req.body.commentInput)
        }
        res.redirect('back')
    }catch(error){
        console.log(error)
        res.redirect('back')
    }
}

module.exports = {
    searchBook,
    showBookDetail,
    comment
}