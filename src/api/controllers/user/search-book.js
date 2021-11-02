const BookHead = require('../../models/book-head.js')
const BookCategory = require('../../models/book-category.js')
const Comment = require('../../models/comment.js')

//search book 
async function searchBook(req, res){
    try{
        let query = BookHead.find().populate('the_loai')
        
        //search option 
        if(req.query.searchBox != null && req.query.searchBox != ''){
            let stringSearchBox = req.query.searchBox.replace(/[&\/\\#,+()$~%.'":*?<>{}[]/g, '') 
            switch (req.query.option) {
                case 'title':{
                    query = query.regex('ten_dau_sach', new RegExp(stringSearchBox, 'i')) 
                    break;
                }
                case 'category':{
                    let tempCategorys = await BookCategory.find().regex('ten_the_loai', new RegExp(stringSearchBox, 'i'))
                    for await (const tempCategory of tempCategorys){
                        query = query.find({the_loai: tempCategory._id})
                    }
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

        const bookHeads = await query.exec()  
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
        const bookHead = await BookHead.findById(req.params.id).populate('the_loai').exec()
        const comment = await Comment.find({ma_dau_sach: req.params.id}).populate('ma_reader').sort({ngay_dang: -1}).exec()
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
        if(req.body.commentInput != null)
        {
            const comment = new Comment(
            {
                ma_reader: '616c4a77e506972ea49eab7a',
                ma_dau_sach: req.params.id,
                noi_dung: req.body.commentInput,
                ngay_dang: Date.now()
            })
            comment
            .save(()=>{
                res.redirect('back')
                console.log(comment)
            })
        }
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