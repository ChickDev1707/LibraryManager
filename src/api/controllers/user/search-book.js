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
        const user = await req.user
        const bookDetailView = getBookDetailView(user)
        const bookHead = await searchBookService.showBookDetail(req.params.id)

        res.render(bookDetailView, { 
            bookHead: bookHead,
            errorMessage: req.query.errorMessage
        })
    } catch(error){
      res.redirect('/')
      console.log(error)
    }
}

function getBookDetailView(user){
    let viewDir;
    if(user!= undefined){
        if(user.vai_tro == "librarian") viewDir = "librarian/book-detail.ejs"
        else if(user.vai_tro == "reader") viewDir = "reader/book-detail.ejs"     
    }else viewDir=  "user/book-detail.ejs"
    return viewDir;
}

//comment book
async function comment(req, res){
    try{
        if(req.body.commentInput != null){
            await searchBookService.comment(req.params.bookHeadId, req.body.commentInput)
            
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