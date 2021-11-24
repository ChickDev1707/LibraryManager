const ObjectId = require('mongodb').ObjectId;

const Book = require('../../models/book-head')
const BookCategory = require('../../models/book-category')

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']



//Get all book
async function getAllBook(){
    try{
        const books = await Book.find().populate('the_loai');
        return books;
    }catch{
        return null;
    }
    
}

//get book by ID
async function getBookByID(id){
    try{
        const book = await Book.findById(id).populate('the_loai');
        return book;
    }
    catch(err){
        console.log(err);
        return null;
    }
}

//Get all book category
async function getBookCategory(){
    try {
        const categories = await BookCategory.find();
        return categories;
    }catch{
        return null;
    }
}

//Save book to database
async function saveBookData(newBook, anh_bia){
   
    var book = new Book(newBook);
    saveBookCover(book, anh_bia)
    //Add book into cac_quyen_sach of BookHead
    for(let i=0;i<book.so_luong;i++)
    {
        var bookChild = {
            _id: new ObjectId(),
            tinh_trang: true
        }
        book.cac_quyen_sach.push(bookChild)
    }

    //try-catch
    try {
       await book.save();
       const category = await BookCategory.find();
       return {success: true, message: `Thêm sách: ${book.ten_dau_sach} thành công`, _id: book._id, book: book, category, category}
    }
    catch{
        return {success: false, message: `Thêm sách: ${book.ten_dau_sach} không thành công!`, _id: null}
    }
}


//Update book
async function updateBookData(id, newBook, anh_bia){
    try{;
        const oldBook = await Book.findById(id);
        if(newBook.so_luong!=undefined && oldBook.so_luong != oldBook.so_luong_kha_dung && oldBook.so_luong != newBook.so_luong )
            return {success: false, message: `${oldBook.ten_dau_sach} đang được mượn, không thể thay đổi số lượng!`};
        else {
            if(anh_bia!= undefined)
                saveBookCover(newBook, anh_bia)
            
            const categories = await BookCategory.find();
            const updated = await Book.findOneAndUpdate({_id: id}, newBook, {useFindAndModify: false, new: true}).populate('the_loai');
            return {success: true, message: "Cập nhật thông tin sách thành công", id: id, book: updated, category: categories, anh_bia: updated.anh_bia};
        }
        
    }catch(err){
        console.log(err)
        return {success: false, message: "Cập nhật thông tin sách không thành công"}
    }
    
}

//Delete book
async function deleteBookData(id){
    const query = {_id: id};
    const option = {useFindAndModify: false};
    try{
        const book = await Book.findById(id);
        if(!book)
            return {success: false, message: `Không thành công: Không tìm thấy thông tin sách cần xoá!`}
        if(book.so_luong != book.so_luong_kha_dung)
            return {success: false, message: `Không thành công: ${book.ten_dau_sach} đang được mượn, không thể xoá thông tin!`}

        const result = await Book.deleteOne(query);

        // return {success: true, message: `Thành công:  ${book.ten_dau_sach} đã được xoá!`}
        if(result.deletedCount){
            return {success: true, message: `Thành công:  ${book.ten_dau_sach} đã được xoá!`}
        }else{
            return {success: false, message: `Không thành công: Xoá thông tin ${book.ten_dau_sach} không thành công!`}
        }
    }
    catch(err){
        console.log(err);
        return ({success: false, message: "Xoá thông tin sách không thành công!"})
    }
}

async function deleteBookChild(id, childId){
    var query = {"_id": id};
    var update1 = {  
        $pull:{"cac_quyen_sach": {_id: childId, tinh_trang: true}},
          
    }

    var update2 = {
        $inc: { "so_luong": -1, "so_luong_kha_dung": -1}  
    }
    var option = {
        new: true, 
        useFindAndModify: false
    }

    try{
        const result1 = await Book.updateOne(query, update1);
        if(result1.modifiedCount && result1.matchedCount){
            const result = await Book.findOneAndUpdate(query, update2, option)
            if(result!=null){
                const category = await BookCategory.find();
                return {success: true, message: "Xoá thành công", newBook: result, category:category}
            }           
            else
                return {success: false, message: "Xoá không thành công", newBook: null, category:null}
        }else{
            return {success: false, message: "Xoá không thành công", newBook: null, category:null}
        }
        
    }catch{
        return {success: true, message: "Xoá không thành công", newBook: null, category:null}
    }
}

async function addBookChild(id, num){
    if(num < 1 )
        return {success: false, newBook: null, newChild: null, message:"Số lượng sách thêm không nhỏ hơn 1!"}
    else if (num == undefined || num ==null)
        return {success: false, newBook: null, newChild: null, message:"Số lượng sách thêm không được bỏ trống!"}
    
        var newBookChilds = [];
    for(let i =0; i< num; i++){
        var newChild = { _id: new ObjectId(), tinh_trang: true};
        newBookChilds.push(newChild);
    }

    const update = {
        $inc: {"so_luong": num, "so_luong_kha_dung": num},
        $push: {cac_quyen_sach: {$each: newBookChilds}}
    }

    const option = {
        new: true, 
        useFindAndModify: false
    }

    const result = await Book.findByIdAndUpdate(id, update, option)
 
    if(result != null)
        return {success: true, newBook: result, newChild: newBookChilds, message:"Thêm sách thành công!"}
    else
        return {success: false, newBook: null, newChild: null, message:"Thêm sách không thành công!"}
}


function saveBookCover(book, avatarEncoded){
    if (avatarEncoded == null) 
        return
    const avatar = JSON.parse(avatarEncoded)
    if (avatar != null && imageMimeTypes.includes(avatar.type)) {
        book.bf_anh_bia = new Buffer.from(avatar.data, 'base64')
        book.kieu_anh_bia = avatar.type
    }
}

async function softDeleteBook(id){
    const query = {_id: id};
    const update = {remove: true};
    const option = {useFindAndModify: false};
    try{
        const result = await Book.updateOne(query, update);
        if(book){
            return {success: true, message: "Xoá thông tin sách thành công!"};
        }
        else
            return {success: false, message: "Xoá thông tin sách không thành công!"};
    }
    catch(err){
        console.log(err);
        return {success: false, message: "Xoá thông tin sách không thành công!"};
    }
}

module.exports.getBookByID = getBookByID;
module.exports.getAllBook = getAllBook;
module.exports.getBookCategory = getBookCategory;
module.exports.saveBookData = saveBookData;
module.exports.deleteBookData = deleteBookData;
module.exports.updateBookData = updateBookData;
module.exports.deleteBookChild = deleteBookChild;
module.exports.addBookChild = addBookChild;