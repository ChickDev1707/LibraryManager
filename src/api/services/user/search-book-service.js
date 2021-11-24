const BookHead = require('../../models/book-head.js')
const BookCategory = require('../../models/book-category.js')
const Comment = require('../../models/comment.js')

//search book
async function searchBook(searchBox, option){
    let query = BookHead.find().populate('the_loai')
    //search option 
    if(searchBox != null && searchBox != ''){
        let stringSearchBox = searchBox.replace(/[&\/\\#,+()$~%.'":*?<>{}[]/g, '') 
        switch (option) {
            case 'title':{
                query = query.regex('ten_dau_sach', new RegExp(stringSearchBox, 'i')) 
                break
            }
            case 'author':{
                query = query.regex('tac_gia', new RegExp(stringSearchBox, 'i')) 
                break
            }
            case 'category':{
                let tempCategorys = await BookCategory.find().regex('ten_the_loai', new RegExp(stringSearchBox, 'i'))
                for await (const tempCategory of tempCategorys){
                    query = query.find({the_loai: tempCategory._id})
                }
                break
            }
            case 'publisher':{
                query = query.regex('nha_xuat_ban', new RegExp(stringSearchBox, 'i')) 
                break
            }
            default: break 
        }
    }
    const bookHeads = await query.exec() 
    return bookHeads
}

//show book details
async function showBookDetail(id){
    const bookHead = await BookHead.findById(id)
    .populate({path: 'cac_nhan_xet', populate: {path: 'doc_gia'}})
    .populate('the_loai')
    .exec()
    return bookHead
}

//post comment 
async function comment(readerId, bookHeadId, commentInput){
    let comment = new Comment({
        doc_gia: readerId,
        noi_dung: commentInput,
        ngay_dang: Date.now()
    })
    await comment.save()
    const update = {$push:{
        cac_nhan_xet: {
            $each: [comment.id],
            $position: 0
        }
    }}
    await BookHead.findByIdAndUpdate(bookHeadId, update, {useFindAndModify: false}).exec()
}

module.exports = {
    searchBook,
    showBookDetail,
    comment
}