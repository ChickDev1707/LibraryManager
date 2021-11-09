const ObjectId = require('mongodb').ObjectId;
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const Book = require('../../models/book-head')
const BookCategory = require('../../models/book-category')

const uploadPath = path.join('./src/public', Book.coverImageBasePath)
const getImagePath = path.join('/public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']


//init storage for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
      cb(null, Date.now().toString() + file.originalname);
    }
  });

//init upload multer
const upload = multer({
    storage: storage,   
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

module.exports.upload = upload;

//Remove book cover image
function removeBookCover(getPath) {
    const fileName = getPath&&getPath.split('\\')[4];
    const removePath = path.join(uploadPath, fileName)
    fs.unlink(removePath, err => {
        if (!err)
            return true;
        console.log("ERROR", err)
        return false; 
            
    })
}

//Get all book
async function getAllBook(){
    try{
        const books = await Book.find();
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
async function saveBookData(newBook){
   
    newBook.anh_bia = path.join(getImagePath, newBook.anh_bia);
    var book = new Book(newBook);

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
       book.save();
       return {success: true, message: `Thêm sách: ${book.ten_dau_sach} thành công`, _id: book._id}
    }
    catch{
        return {success: false, message: `Thêm sách: ${book.ten_dau_sach} không thành công!`, _id: null}
    }
}


//Update book
async function updateBookData(id, newBook){
    try{;
        const oldBook = await Book.findById(id);
        if(oldBook.so_luong != oldBook.so_luong_kha_dung && oldBook.so_luong != newBook.so_luong)
            return res.json({success: false, message: `${oldBook.ten_dau_sach} đang được mượn, không thể thay đổi số lượng!`});
        else {
            if(newBook.anh_bia == undefined)
                delete newBook.anh_bia;
            else
                newBook.anh_bia = path.join(getImagePath, newBook.anh_bia.filename);
            const updated = await Book.updateOne({_id: id}, newBook);
            if(updated.ok && newBook.anh_bia != undefined)
                removeBookCover(oldBook.anh_bia);
                
            return {success: true, message: "Cập nhật thông tin sách thành công"};
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
        if(result.ok){
            removeBookCover(book.anh_bia);
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


async function softDeleteBook(id){
    const query = {_id: id};
    const update = {remove: true};
    const option = {useFindAndModify: false};
    try{
        const result = await Book.updateOne(query, update);
        if(book){
            removeBookCover(book.anh_bia);
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