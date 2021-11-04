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
    const bookHead = await BookHead.findById(id).populate('the_loai').exec()
    const comment = await Comment.find({ma_dau_sach: id}).populate('ma_reader').sort({ngay_dang: -1}).exec()

    return {bookHead, comment}
}

//post comment 
async function comment(id, commentInput){
    let comment = new Comment({
        ma_reader: '616c4a77e506972ea49eab7a',
        ma_dau_sach: id,
        noi_dung: commentInput,
        ngay_dang: Date.now()
    })
    await comment.save()
}

module.exports = {
    searchBook,
    showBookDetail,
    comment
}