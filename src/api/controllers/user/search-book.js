const BookHead = require('../../models/book-head.js')
const BookType = require('../../models/book-type.js')
const Comment = require('../../models/comment.js')

//search book 
async function searhBook(req, res){
    let query = BookHead.find()
    //option filter
    if(req.query.searchBox != null && req.query.searchBox != ''){
        let stringSearchBox = req.query.searchBox.replace(/[&\/\\#,+()$~%.'":*?<>{}[]/g, '')
        switch (req.query.option) {
            case 'default':{
                query = query.regex('ten_dau_sach', new RegExp(stringSearchBox, 'i')) 
                break;
            }
            case 'title':{
                query = query.regex('ten_dau_sach', new RegExp(stringSearchBox, 'i')) 
                break;
            }
            case 'bookId':{
                query = query.find({ma_dau_sach: stringSearchBox})
                break;
            }
            case 'publisher':{
                query = query.regex('nha_xuat_ban', new RegExp(stringSearchBox, 'i')) 
                break;
            }
            default:
                break;  
        }
    }
    //type filter
    if (req.query.bookType != null && req.query.bookType != '' && req.query.bookType != 'default') { 
        query = query.find({the_loai: req.query.bookType})
    }
    //sort filter
    switch (req.query.sortBy) {
        case 'earliestPublication':{
            query = query.sort({nam_xuat_ban: 1})
            break;
        }
        case 'latestPublication':{
            query = query.sort({nam_xuat_ban: -1})
            break;
        }
        default:
            break;
    }
    //try-catch
    try{
        const bookTypes = await BookType.find({})
        const bookHeads = await query.exec()   
        res.render('user/index.ejs', {
            bookTypes: bookTypes,
            bookHeads: bookHeads,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/')
        console.log(error)
    }
}

//show book details page
async function showBookDetail(req, res){
    try {
        const bookHead = await BookHead.findById(req.params.id).exec()
        const comment = await Comment.find({ma_dau_sach: req.params.id}).sort({ngay_dang: -1})
        res.render('user/book-detail.ejs', { 
            bookHead: bookHead, 
            comment: comment
        })
    } catch {
      res.redirect('/')
      console.log(error)
    }
}

//comment book
async function comment(req, res){
    try{
        if(req.body.commentInput != null)
        {
            const comment = new Comment(
            {
                ma_doc_gia: '616c4a77e506972ea49eab7a',
                ma_dau_sach: req.params.id,
                noi_dung: req.body.commentInput,
                ngay_dang: 0
            })
            comment
            .save(()=>{
                res.redirect('back')
            })
        }
    }catch{
        console.log(error)
        res.redirect('back')
    }
}

module.exports = {
    searhBook,
    showBookDetail,
    comment
}