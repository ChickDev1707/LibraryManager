const BookCategory = require('../../models/book-category');
const { getAllBook, getBookCategory, saveBookData, getBookByID, deleteBookData, updateBookData, deleteBookChild, addBookChild } = require('../../services/librarian/manage-book-service');
const ejs = require('ejs');
const path = require('path')

//Render all books page
async function all(req, res){
    //try-catch
    try {
        //Query find book
        const books = await  getAllBook();
        const bookCategories = await getBookCategory()
        res.render('librarian/book-management/all', {
          books: books,
          bookCategories: bookCategories,
          searchOptions: req.query
        })
    }
    catch (err){
        console.log(err)
        res.send(err)
    }
}

//----------------New book page------------------------------

//Add new book 
async function saveBook(req, res){
    //Init book data
    const book = {
        ten_dau_sach: req.body.ten_dau_sach,
        the_loai: req.body.the_loai,
        tac_gia: req.body.tac_gia,
        nam_xuat_ban: req.body.nam_xuat_ban,
        nha_xuat_ban: req.body.nha_xuat_ban,
        ngay_nhap: req.body.ngay_nhap,
        gia: req.body.gia,
        so_luong: req.body.so_luong,
        tom_tat: req.body.tom_tat,
        so_luong_kha_dung: req.body.so_luong
    }

    //Save book data
    const result = await saveBookData(book, req.body.anh_bia);

    // res.render("partials/book-management/edit_copy", {book: result.book, bookCategories: result.category})
    // res.json(result)
    var rootPath = path.resolve('./');
    var editPath =  rootPath.concat('\\src\\api\\views\\partials\\book-management\\edit_add.ejs');
    var rowPath = rootPath.concat('\\src\\api\\views\\partials\\book-management\\row.ejs')
    if(result.success){
        ejs.renderFile(editPath, {book: result.book, bookCategories: result.category}, function(err, str){
            result.newModal = str
            ejs.renderFile(rowPath, {book: result.book}, function(err, str1){
                result.newRow = str1;
                res.json(result);
            });
         });
    }else{
        result.newModal = "";
        result.newRow = "";
        res.json(result);
    }
   
   
}

//--------------------Book Detail--------------------

//Render view book
async function bookDetail(req, res){
    var bookId = req.params['id']
    //try-catch
    try {
        //find book 
        const book = await getBookByID(bookId);
        if(book)
            res.render('librarian/book-management/view', {
                book: book
            })
        else
            res.send("Không tìm thấy thông tin sách")
    }
    catch(err){
        console.log(err)
    }
}



//Update book
async function updateBook(req, res){
    //Middleware error
    if(req.error)
    {
        res.json({success: false, message: req.message})
    }
    else {
        var id = req.params['id'];
        //new book
        let newBook = {
            ten_dau_sach: req.body.ten_dau_sach,
            the_loai: req.body.the_loai,
            tac_gia: req.body.tac_gia,
            nam_xuat_ban: req.body.nam_xuat_ban,
            nha_xuat_ban: req.body.nha_xuat_ban,
            ngay_nhap: req.body.ngay_nhap,
            gia: req.body.gia,
            tom_tat: req.body.tom_tat
        };
        
        const result = await updateBookData(id, newBook, req.body.anh_bia)
       
        res.json(result)
    }
}



//------------------------Delete book-----------------

//Delete Book 
async function deleteBook(req, res) {
    var bookId;
    if(req.params)
        bookId = req.params['id'];
    else
        return {success: false, message: "Không tìm thấy sách!"};

    //Try-catch
    try {
        //Query find book
        let result = await deleteBookData(bookId);
        return res.json(result);
    }
    catch (err){
        console.log(err)
        return  res.json({success: false, message: "Xoá sách không thành công!"});
    }
}

async function deleteChildBook(req, res){
    const id = req.params["id"];
    const childId = req.params["child"];
    var result = await deleteBookChild(id, childId);
    res.json(result);
}


async function addChildBook(req, res){
    const id = req.params['id'];
    const number = req.body.so_luong;
    const result = await addBookChild(id, number)
    res.json(result)
}


module.exports = {
    all,
    bookDetail,
    saveBook,
    updateBook,
    deleteBook,
    deleteChildBook,
    addChildBook
};
