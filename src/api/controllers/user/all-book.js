
const {getBooksInPage} = require('../../services/user/all-book')
async function getPage(req, res){
  if(req.params.id != null && req.params.id != ''){
    let pageIndex = Number(req.params.id)
    let result = await getBooksInPage(pageIndex)
    res.render(req.allBookPage, {
      bookHeads: result.books,
      pageIndex,
      pageLimit: result.pageLimit
    })
  }
}

module.exports ={
  getPage
}