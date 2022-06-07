const BookHead = require('../../models/book-head.js')
const BookCategory = require('../../models/book-category.js')
const Comment = require('../../models/comment.js')
const BorrowReturnCart = require('../../models/borrow-return-card')

//autocomplete search

async function autocompleteSearch(req, res){
    var regex = new RegExp(req.query["term"], 'i')

    var bookHeadFilter = BookHead
    .find({ten_dau_sach: regex}, {'ten_dau_sach': 1})
    .exec(function(err, data){
      var result = [];
      if(!err){
        if(data && data.length && data.length>0){
          data.forEach(bookHead=>{
            let obj = {
              id: bookHead._id,
              label: bookHead.ten_dau_sach
            };
            result.push(obj);
          });
        }
        res.jsonp(result);
      }
    })
}

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
    const bookHeads = await query.limit(20).exec() 
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
async function comment(readerId, bookHeadId, commentInput, voteStart){
    const bookHead = await BookHead.findById(bookHeadId).populate('cac_nhan_xet')
    var vote = Number(voteStart)
    var daBinhLuan = false
    for(i=0; i< bookHead.cac_nhan_xet.length; i++){
        if(bookHead.cac_nhan_xet[i].doc_gia.equals(readerId)){
            daBinhLuan = true
            break
        }
        console.log(bookHead.cac_nhan_xet[i].sao_danh_gia)
        vote = vote + bookHead.cac_nhan_xet[i].sao_danh_gia
    }
    if(daBinhLuan){
        return "Đã bình luận";
    }

    vote = vote/(bookHead.cac_nhan_xet.length+1)
    
    let comment = new Comment({
        doc_gia: readerId,
        noi_dung: commentInput,
        ngay_dang: Date.now(),
        sao_danh_gia: voteStart
    })
    await comment.save()
    
    
    const update = {$push:{
        cac_nhan_xet: {
            $each: [comment.id],
            $position: 0
        }
    },
    $set:{
        sao_danh_gia: vote
    }}
    await BookHead.findByIdAndUpdate(bookHeadId, update, {useFindAndModify: false}).exec()
    
    return "Thành công";
}
//put update comment
async function editComment(bookHeadId, commentId, commentInput, voteStart){
    const filter = { _id: commentId };
    const updateCM = { noi_dung: commentInput, sao_danh_gia: voteStart };
    let updateComment = await Comment.findOneAndUpdate(filter,updateCM,{new:true}).exec()

    var vote = 0
    const bookHead = await BookHead.findById(bookHeadId).populate('cac_nhan_xet')
    for(i=0; i< bookHead.cac_nhan_xet.length; i++){
        console.log(bookHead.cac_nhan_xet[i].sao_danh_gia)
        vote = vote + bookHead.cac_nhan_xet[i].sao_danh_gia
    }

    vote = vote/bookHead.cac_nhan_xet.length
    
    const update = {$set:{
        sao_danh_gia: vote
    }}
    await BookHead.findByIdAndUpdate(bookHeadId, update, {useFindAndModify: false}).exec()
    
    return "Thành công";
}

//delete comment
async function deleteComment(bookHeadId, commentId){
   const deleteComment = {$pull: {cac_nhan_xet: commentId}}
   await BookHead.updateOne({_id: bookHeadId}, deleteComment)

   var vote = 0
    const bookHead = await BookHead.findById(bookHeadId).populate('cac_nhan_xet')
    for(i=0; i< bookHead.cac_nhan_xet.length; i++){
        console.log(bookHead.cac_nhan_xet[i].sao_danh_gia)
        vote = vote + bookHead.cac_nhan_xet[i].sao_danh_gia
    }

    vote = vote/bookHead.cac_nhan_xet.length
    
    const update = {$set:{
        sao_danh_gia: vote
    }}
    await BookHead.findByIdAndUpdate(bookHeadId, update, {useFindAndModify: false}).exec()
    
   await Comment.deleteOne({_id: commentId})
   return "Thành công";
}

module.exports = {
    searchBook,
    showBookDetail,
    comment,
    autocompleteSearch,
    editComment,
    deleteComment
}